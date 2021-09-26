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
  /^(babel|commitlint|jest)\.config\.js$/,
  '.travis.yml',
  'yarn.lock',
  'package-lock.json',
  'yarn-error.log',
  'appveyor.yml',
  '.watchmanconfig',
  '.yarnrc',
  'karma.conf.js',
  '.flowconfig',
  /^changelog/i,
  /^\.?simple-pre-commit.js(on)?$/,
  /^\.commitlintrc/,
  /^\.renovaterc/,
  /^\.remarkrc/,
]
