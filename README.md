# Clean Publish

Clean publish is a tool for removing configuration files and fields in package.json before publishing to npm.

## How it works

`clean-publish` command copies project files (excluding configuration files) to a temporary folder, removes the extra from package.json, and calls npm publish on the temporary folder.

## Usage

First, install `clean-publish`:

```sh
$ npm install --save-dev clean-publish

# or

$ yarn add clean-publish --dev
```

Add `clean-publish` script to `package.json`:

```json
{
  "scripts": "clean-publish"
}
```

## Exclude files and package.json fields

* Files:

- `.eslintrc`,
- `.eslintignore`,
- `.babelrc`,
- `.editorconfig`,
- `.jsdocrc`,
- `.lintstagedrc`,
- `.size-limit`,
- `.yaspellerrc`,
- `jest.config.js`,
- `.travis.yml`,
- `yarn.lock`,
- `package-lock.json`,
- `yarn-error.log`,
- `appveyor.ym`

* Fields:

- `eslintConfig`,
- `jest`,
- `yaspeller`,
- `size-limit`,
- `devDependencies`,
- `babel`

## Example

* Before `clean-publish`

Files and directories
```
node_modules
.eslintrc
.prettierrc
jest.config.js
CHANGELOG.md  
package.json
README.md
yarn.lock
```

package.json
```json
{
  "name": "your-package",
  "version": "1.0.0",
  "description": "description",
  "author": "author",
  "license": "MIT",
  "scripts": {
    "test": "test"
  },
  "dependencies": {
    "chalk": "^2.4.1",
    "fs-extra": "^6.0.1",
    "lodash.omit": "^4.5.0"
  },
  "devDependencies": {
    "eslint": "^5.1.0",
    "eslint-config-logux": "^23.0.2",
    "eslint-config-standard": "^11.0.0",
    "eslint-plugin-import": "^2.13.0",
    "eslint-plugin-jest": "^21.17.0",
    "eslint-plugin-node": "^6.0.1",
    "eslint-plugin-promise": "^3.8.0",
    "eslint-plugin-security": "^1.4.0",
    "eslint-plugin-standard": "^3.1.0"
  }
}
```

* After `clean-publish`

Files and directories
```diff
node_modules
CHANGELOG.md  
package.json
README.md
- .eslintrc
- .prettierrc
- jest.config.js
- yarn.lock
```

package.json
```diff
{
  "name": "your-package",
  "version": "1.0.0",
  "description": "description",
  "author": "author",
  "license": "MIT",
  "scripts": {
    "test": "test"
  },
  "dependencies": {
    "chalk": "^2.4.1",
    "fs-extra": "^6.0.1",
    "lodash.omit": "^4.5.0"
  },
-  "devDependencies": {
-    "eslint": "^5.1.0",
-    "eslint-config-logux": "^23.0.2",
-    "eslint-config-standard": "^11.0.0",
-    "eslint-plugin-import": "^2.13.0",
-    "eslint-plugin-jest": "^21.17.0",
-    "eslint-plugin-node": "^6.0.1",
-    "eslint-plugin-promise": "^3.8.0",
-    "eslint-plugin-security": "^1.4.0",
-    "eslint-plugin-standard": "^3.1.0"
-  }
}
```