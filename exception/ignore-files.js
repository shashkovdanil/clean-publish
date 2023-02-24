export default [
  '.circleci',
  '.github',
  '.vscode',
  'node_modules',
  'test',
  /^\.eslintrc/,
  /^\.babelrc/,
  /^\.yaspellerrc/,
  /^\.prettierrc/,
  /^\.jsdocrc/,
  /^\.lintstagedrc/,
  /^\.jsconfig/,
  /^\.size-limit/,
  /^\.clean-publish/,
  '.git',
  '.DS_Store',
  '.eslintignore',
  '.editorconfig',
  /^(babel|commitlint|jest|webpack|rollup)\.config\.[cm]?js$/,
  '.travis.yml',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  'pnpm-debug.log',
  'yarn-error.log',
  'appveyor.yml',
  '.watchmanconfig',
  '.yarnrc',
  'karma.conf.js',
  '.flowconfig',
  /^changelog/i,
  /^\.?simple-pre-commit.js(on)?$/,
  /^\.?simple-git-hooks.js(on)?$/,
  /^\.commitlintrc/,
  /^\.renovaterc/,
  /^\.remarkrc/,
  /README\.[\w-]+\.md/
]
