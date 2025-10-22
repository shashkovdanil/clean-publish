# Change Log

## 6.0.1
* Fixed CLI calls (by @hyperz111).

## 6.0.0
* Removed Node.js 18 support.
* Reduced dependencies (by @hyperz111).

## 5.2.2
* Fixed false-positive ChangeLog ignoring (by @dangreen).

## 5.2.1
* Fixed `scripts` removal (by @dangreen).

## 5.2
* Allow to use path in `fields` (by @pyoner).

## 5.1
* Keep `prepare` script (by @azat-io).

## 5.0
* Removed Node.js 16 support.
* Added Dev Container config support.

## 4.4
* Added `publishConfig` to ignore fields (by Dan Onoshko).

## 4.3
* Added ESLint flat config to ignore files.
* Added Nano Stages config to ignore files (by Eduard Aksamitov).

## 4.2
* Added Vitest config support (by @azat-io).

## 4.1.1
* Added types for config (by Artiom Tretjakovas).
* Fixed `--clean-comments` (by Artiom Tretjakovas).
* Fixed `--tag` (by Artiom Tretjakovas).

## 4.1
* Added `.clean-publish.json` config support (by Artiom Tretjakovas).

## 4.0.2
* Fixed full docs URL by using homepage (by Morgan Brasseur).

## 4.0.1
* Fixed `/**/` comments cleaning on `cleanComments` option.

## 4.0
* Dropped Node.js 14 and 12 support.
* Added `--` support to pass any arguments to package manager (by Dan Onoshko).
* Added pattern support to `files` option (by Dan Onoshko).
* Added `package.publishConfig` support in `exports` cleaning (by Dan Onoshko).
* Removed `--exports` option (by Dan Onoshko).
* Reduced dependencies.

## 3.4.5
* Added `pnpm` support.

## 3.4.4
* Fixed cleaning `publish` script with `clean-publish` (by Nikita Karamov).

## 3.4.3
* Added `c8` support.

## 3.4.2
* Fixed `packageManager` option (by Dan Onoshko).

## 3.4.1
* Fixed repository URL parsing for `cleanDocs` (by Dan Onoshko).

## 3.4
* Added `--tmp-dir` argument (by Dan Onoshko).

## 3.3
* Added `exports` option (by Dan Onoshko).

## 3.2
* Added `--dry-run` argument (by Igor Kamyshev).

## 3.1
* Added `cleanComments` option.

## 3.0.3
* Fixed Node.js 12 support.

## 3.0.2
* Added `README` translations to ignore.

## 3.0.1
* Fixed `cleanDocs` option.
* Reduced package size.

## 3.0
* Added `cleanDocs` option.
* Removed Node.js 10 support.

## 2.2
* Added `commitlint` support (by @JounQin).
* Added `remark` support (by @JounQin).
* Added `renovate` (by @JounQin).
* Added `typeCoverage` support (by @JounQin).
* Added Yarn `resolutions` support (by @JounQin).

## 2.1.1
* Added `uninstall` to ignored scripts (by Mikhail Gorbunov).

## 2.1
* Added `simple-git-hooks` to ignored fields.

## 2.0
* Set Node.js 12 as a minimum requirement.
* Added `ChangeLog` to ignored files.
* Reduced dependencies.

## 1.0.7
* Remove empty fields from package.json
* Fix README

## 1.0.6
* Fix regexp indexOf func
* Write test
* Add without-publish arguments

## 1.0.5
* Fix publish

## 1.0.4
* Test release

## 1.0.3
* Add files and fields arguments for command
* Add CI
* Add linting
* Remove package.json unused scripts

## 1.0.2
* Remove fields from package.json
* Publish after clean

## 1.0.1
* Remove config files and copy right file to tmp directory
