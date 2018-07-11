# Clean Publish

Clean publish is a tool for removing configuration files and fields in package.json before publishing to npm.

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