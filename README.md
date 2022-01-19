# Clean Publish
[![Build Status](https://travis-ci.org/shashkovdanil/clean-publish.svg?branch=master)](https://travis-ci.org/shashkovdanil/clean-publish)

<img src="./img/logo.svg" title="Clean Publish logo by Anton Panachev <pana4eow@yandex.ru>" width="180" height="180" align="right">

Clean Publish is a tool for removing configuration files, fields and script for development from `package.json` before publishing to `npm`.

## Table of Contents
1. [How it works](#how-it-works)
2. [Usage](#usage)
3. [Config](#config)
4. [Exclude files and package.json fields](#exclude-files-and-packagejson-fields)
5. [Examples](#examples)

## How it works

`clean-publish` command copies project files (excluding configuration files) to a temporary folder, removes the extra and development script from `package.json`, and calls `npm publish` on the temporary folder.

**Simple example:**

- Before clean:

```
node_modules
src
.eslintrc
.prettierrc
package.json
```
```json
{
  "name": "author",
  "scripts": {
    "lint": "eslint"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

- After clean:

`node_modules`, `.eslintrc`, `.prettierrc`, `lint` script and `devDependecies` field was removed (empty objects will also be deleted).

```
src
package.json
```
```json
{
  "name": "author",
}
```

[More examples](#examples)

## Usage

1. install `clean-publish`:

```sh
$ npm install --save-dev clean-publish

# or

$ yarn add clean-publish --dev
```

2. Add `clean-publish` script to `package.json`:

```diff
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
+   "publish": "clean-publish"
  }
}

```

3. Usage with arguments:

- `clean-docs` - keep only main section of `README.md`.
- `clean-comments` - clean inline comments from JS files.
- `files` - list of files that you want to delete before publishing (supports regex and glob patterns)
- `fields` - list of fields in the `package.json` file that you want to delete before publishing
- `without-publish` - clean project without `npm publish` (tmp directory will not be deleted automatically)
- `package-manager` - name of package manager to use (`npm` by default)
- `access` - whether the npm registry publishes this package as a public package, or restricted
- `before-script` - run script on the to-release dir before `npm publish`
- `temp-dir` - create temporary directory with given name.

```sh
$ npx clean-publish --files file1.js file2.js --fields scripts name
```

Also you are able to pass options to package manager:

```sh
$ npx clean-publish --package-manager yarn -- --access public
```

### clear-package-json

`clear-package-json` is additional tool to work only with `package.json` file.

```sh
$ npx clear-package-json package.json -o package/package.json --fields scripts name
# or
$ npx clear-package-json package.json > package/package.json
# or
$ cat package.json | npx clear-package-json
# `fields` also will be getted from config file
```

### Usage with [Lerna](https://github.com/lerna/lerna)

```sh
# Clean each package using `package` temporary directory without publish it
lerna exec -- clean-publish --without-publish --temp-dir package
# Publish all packages from `package` subdirectory
lerna publish --contents package
```
### Usage with [pnpm](https://pnpm.io/)

Just add this in your package.json:

```json
{
  "publishConfig": {
    "directory": "package"
  },
  "scripts": {
    "prepublishOnly": "rm -rf ./package && clean-publish",
    "postpublish": "rm -rf ./package"
  },
  "clean-publish": {
    "withoutPublish": true,
    "tempDir": "package"
  }
}
```

Then you can use regular `pnpm publish` command for publishing.

### Usage with [pnpm workspaces](https://pnpm.io/workspaces)

Just create `.clean-publish` in workspace root:

```json
{
  "withoutPublish": true,
  "tempDir": "package"
}
```

and add this into each subpackage's package.json:

```json
{
  "publishConfig": {
    "directory": "package"
  },
  "scripts": {
    "prepublishOnly": "rm -rf ./package && clean-publish",
    "postpublish": "rm -rf ./package"
  }
}
```

Then you can use regular `pnpm publish -r` command for publishing.

## Config

Clean Publish also supports 3 ways to define config.

1. `clean-publish` section to `package.json`:

```json
"clean-publish": {
  "files": ["file1.js", "file2.js"],
  "packageManager": "yarn"
}
```

2. or separated `.clean-publish` config file:

```js
{
  "files": ["file1.js", "file2.js"],
  "packageManager": "yarn"
}
```

3. or more flexible `.clean-publish.js` config file:

```js
module.exports = {
  "files": ["file1.js", "file2.js"],
  "packageManager": "yarn"
}
```

## Publish config

All package managers have different support of [`publishConfig` filed in package.json](https://github.com/stereobooster/package.json#publishconfig). `clean-publish` handles this field like [pnpm does](https://pnpm.io/ru/package_json#publishconfig) but also cleans and removes it from package.json if possible.

- Before clean:

```json
{
  "main": "./src/index.ts",
  "publishConfig": {
    "main": "./dist/index.cjs",
    "module": "./dist/index.js",
    "directory": "package"
  }
}
```

- After clean:

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "publishConfig": {
    "directory": "package"
  }
}
```

## Exclude files and package.json fields

[Ignore files](https://github.com/shashkovdanil/clean-publish/blob/master/exception/ignore-files.js)

[Ignore fields](https://github.com/shashkovdanil/clean-publish/blob/master/exception/ignore-fields.js)

[Ignore npm scripts](https://github.com/shashkovdanil/clean-publish/blob/master/exception/npm-scripts.js)

## Examples

**[Jest](https://github.com/facebook/jest)**

```diff
- .circleci
- .github
- .vscode
docs
e2e
examples
fixtures
flow-typed
packages
scripts
types
website
- .babelrc
- .editorconfig
- .eslintignore
- .eslintrc.js
- .flowconfig
.gitignore
.npmignore
- .travis.yml
- .watchmanconfig
- .yarnrc
CHANGELOG.md
CONTRIBUTING.md
LICENSE
README.md
TestUtils.js
- appveyor.yml
crowdin.yaml
eslintImportResolver.js
jest
- jsconfig.json
- karma.conf.js
lerna.json
package.json
testSetupFile.js
- yarn.lock

package.json
{
  "private": true,
-  "devDependencies": {
-    "ansi-regex": "^3.0.0",
-    "ansi-styles": "^3.2.0",
-    "babel-core": "^6.23.1",
-    "babel-eslint": "^8.2.3",
-    "babel-plugin-external-helpers": "^6.22.0",
-    "babel-plugin-syntax-trailing-function-commas": "^6.13.0",
-    "babel-plugin-transform-async-to-generator": "^6.16.0",
-    "babel-plugin-transform-es2015-destructuring": "^6.23.0",
-    "babel-plugin-transform-es2015-modules-commonjs": "^6.26.0",
-    "babel-plugin-transform-es2015-parameters": "^6.23.0",
-    "babel-plugin-transform-es2015-shorthand-properties": "^6.24.1",
-    "babel-plugin-transform-es2015-spread": "^6.22.0",
-    "babel-plugin-transform-flow-strip-types": "^6.18.0",
-    "babel-plugin-transform-inline-imports-commonjs": "^1.2.0",
-    "babel-plugin-transform-runtime": "^6.23.0",
-    "babel-plugin-transform-strict-mode": "^6.24.1",
-    "babel-preset-env": "^1.4.0",
-    "babel-preset-react": "^6.24.1",
-    "babel-preset-react-native": "^4.0.0",
-    "babel-register": "^6.26.0",
-    "browserify": "^16.1.0",
-    "chalk": "^2.0.1",
-    "codecov": "^3.0.0",
-    "debug": "^3.0.1",
-    "eslint": "^4.19.1",
-    "eslint-config-prettier": "^2.9.0",
-    "eslint-plugin-babel": "^5.1.0",
-    "eslint-plugin-flowtype": "^2.35.0",
-    "eslint-plugin-import": "^2.6.0",
-    "eslint-plugin-jest": "^21.0.0",
-    "eslint-plugin-jsx-a11y": "^6.0.2",
-    "eslint-plugin-markdown": "^1.0.0-beta.6",
-    "eslint-plugin-prettier": "^2.3.1",
-    "eslint-plugin-react": "^7.1.0",
-    "eslint-plugin-relay": "~0.0.19",
-    "execa": "^0.10.0",
-    "flow-bin": "^0.75.0",
-    "glob": "^7.1.1",
-    "graceful-fs": "^4.1.11",
-    "istanbul-api": "^1.3.1",
-    "istanbul-lib-coverage": "^1.0.0",
-    "jasmine-reporters": "^2.2.0",
-    "jest-junit": "^5.1.0",
-    "jest-simple-dot-reporter": "^1.0.2",
-    "jquery": "^3.2.1",
-    "karma": "^2.0.0",
-    "karma-browserify": "^5.1.1",
-    "karma-chrome-launcher": "^2.1.1",
-    "karma-mocha": "^1.3.0",
-    "left-pad": "^1.1.1",
-    "lerna": "2.11.0",
-    "micromatch": "^2.3.11",
-    "mkdirp": "^0.5.1",
-    "mocha": "^5.0.1",
-    "mock-fs": "^4.4.1",
-    "prettier": "^1.13.3",
-    "prettylint": "^1.0.0",
-    "progress": "^2.0.0",
-    "readable-stream": "^2.3.6",
-    "regenerator-runtime": "^0.11.0",
-    "resolve": "^1.4.0",
-    "rimraf": "^2.6.2",
-    "rollup": "^0.56.2",
-    "rollup-plugin-babel": "^3.0.2",
-    "rollup-plugin-commonjs": "^8.2.1",
-    "rollup-plugin-flow": "^1.1.1",
-    "rollup-plugin-json": "^2.1.1",
-    "rollup-plugin-node-builtins": "^2.1.1",
-    "rollup-plugin-node-globals": "^1.1.0",
-    "rollup-plugin-node-resolve": "^3.0.0",
-    "slash": "^1.0.0",
-    "string-length": "^2.0.0",
-    "strip-ansi": "^4.0.0",
-    "typescript": "^2.2.2",
-    "watchify": "^3.9.0"
-  },
  "scripts": {
-    "build-clean": "rm -rf ./packages/*/build ./packages/*/build-es5",
-    "build": "node ./scripts/build.js",
-    "clean-all": "rm -rf ./node_modules && rm -rf ./packages/*/node_modules && rm -rf ./e2e/*/*/node_modules && yarn build-clean",
-    "jest": "node ./packages/jest-cli/bin/jest.js",
-    "jest-coverage": "yarn jest --coverage",
-    "lint": "eslint . --cache --ext js,md",
-    "lint-es5-build": "eslint --no-eslintrc --no-ignore --env=browser packages/*/build-es5",
-    "lint:md": "yarn --silent lint:md:ci --fix",
-    "lint:md:ci": "prettylint '**/*.md' --ignore-path .gitignore",
    "postinstall": "opencollective postinstall && yarn build",
    "publish": "yarn build-clean && yarn build && lerna publish --silent",
-    "test-ci-es5-build-in-browser": "karma start --single-run",
-    "test-ci": "yarn jest-coverage -i --reporters jest-simple-dot-reporter jest-junit && yarn test-leak && node scripts/mapCoverage.js && codecov",
-    "test-ci-partial": "yarn jest -i --reporters jest-simple-dot-reporter jest-junit",
-    "test-pretty-format-perf": "node packages/pretty-format/perf/test.js",
-    "test-leak": "yarn jest -i --detectLeaks jest-mock jest-diff jest-repl",
    "test": "yarn typecheck && yarn lint && yarn jest",
-    "typecheck": "flow check --include-warnings",
-    "watch": "yarn build && node ./scripts/watch.js"
  },
  "workspaces": [
    "packages/*",
    "website",
    "examples/*"
  ],
-  "jest": {
-    "modulePathIgnorePatterns": [
-      "examples/.*",
-      "packages/.*/build",
-      "packages/.*/build-es5",
-      "packages/jest-runtime/src/__tests__/test_root.*",
-      "website/.*",
-      "e2e/runtime-internal-module-registry/__mocks__"
-    ],
-    "collectCoverageFrom": [
-      "**/packages/jest-*/**/*.js",
-      "**/packages/eslint-*/**/*.js",
-      "**/packages/pretty-format/**/*.js",
-      "!**/bin/**",
-      "!**/cli/**",
-      "!**/perf/**",
-      "!**/__mocks__/**",
-      "!**/__tests__/**",
-      "!e2e/**"
-    ],
-    "coverageReporters": [
-      "json"
-    ],
-    "projects": [
-      "<rootDir>",
-      "<rootDir>/examples/*/"
-    ],
-    "transform": {
-      "^.+\\.js$": "<rootDir>/packages/babel-jest"
-    },
-    "setupTestFrameworkScriptFile": "<rootDir>/testSetupFile.js",
-    "snapshotSerializers": [
-      "<rootDir>/packages/pretty-format/build/plugins/convert_ansi.js"
-    ],
-    "testEnvironment": "./packages/jest-environment-node",
-    "testPathIgnorePatterns": [
-      "/node_modules/",
-      "/examples/",
-      "/e2e/.*/__tests__",
-      "\\.snap$",
-      "/packages/.*/build",
-      "/packages/.*/build-es5",
-      "/packages/.*/src/__tests__/expect_util.js",
-      "/packages/jest-cli/src/__tests__/test_root",
-      "/packages/jest-cli/src/__tests__/__fixtures__/",
-      "/packages/jest-cli/src/lib/__tests__/fixtures/",
-      "/packages/jest-haste-map/src/__tests__/haste_impl.js",
-      "/packages/jest-resolve-dependencies/src/__tests__/__fixtures__/",
-      "/packages/jest-runtime/src/__tests__/defaultResolver.js",
-      "/packages/jest-runtime/src/__tests__/module_dir/",
-      "/packages/jest-runtime/src/__tests__/NODE_PATH_dir",
-      "/packages/jest-snapshot/src/__tests__/plugins",
-      "/packages/jest-validate/src/__tests__/fixtures/",
-      "/packages/jest-worker/src/__performance_tests__",
-      "/packages/pretty-format/perf/test.js",
-      "/e2e/__tests__/iterator-to-null-test.js"
-    ]
-  },
-  "prettier": {
-    "bracketSpacing": false,
-    "proseWrap": "never",
-    "singleQuote": true,
-    "trailingComma": "all"
-  },
  "dependencies": {
    "opencollective": "^1.0.3"
  },
  "collective": {
    "type": "opencollective",
    "url": "https://opencollective.com/jest",
    "logo": "https://opencollective.com/jest/logo.txt"
  }
}
```
