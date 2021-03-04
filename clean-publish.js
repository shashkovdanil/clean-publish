#!/usr/bin/env node

const {
  createTempDirectory,
  readSrcDirectory,
  clearFilesList,
  copyFiles,
  readPackageJSON,
  clearPackageJSON,
  writePackageJSON,
  publish,
  removeTempDirectory,
  runScript
} = require('./core')
const getConfig = require('./get-config')

const HELP = 'npx clean-publish\n' +
  '\n' +
  'Options:\n' +
  '  --help             Show help\n' +
  '  --version          Show version number\n' +
  '  --files            One or more exclude files\n' +
  '  --fields           One or more exclude package.json fields\n' +
  '  --without-publish  Clean package without npm publish\n' +
  '  --package-manager  Package manager to use\n' +
  '  --access           Whether the npm registry publishes this package\n' +
  '                     as a public package, or restricted\n' +
  '  --before-script    Run script on the to-release dir before npm\n' +
  '                     publish'

const options = {}
let tempDirectoryName

function handleOptions () {
  options.packageManager = 'npm'
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--help') {
      console.log(HELP)
      process.exit(0)
    } else if (process.argv[i] === '--version') {
      console.log(require('./package.json').version)
      process.exit(0)
    } else if (process.argv[i] === '--without-publish') {
      options.withoutPublish = true
    } else if (process.argv[i] === '--package-manager') {
      options.packageManager = process.argv[i + 1]
      i += 1
    } else if (process.argv[i] === '--before-script') {
      options.beforeScript = process.argv[i + 1]
      i += 1
    } else if (process.argv[i] === '--access') {
      options.access = process.argv[i + 1]
      i += 1
    } else if (process.argv[i] === '--files') {
      options.files = process.argv[i + 1].split(/,\s*/)
      i += 1
    } else if (process.argv[i] === '--fields') {
      options.fields = process.argv[i + 1].split(/,\s*/)
      i += 1
    } else {
      options['_'] = process.argv[i]
    }
  }
  if (!options['_']) {
    return getConfig().then(config => {
      Object.assign(options, config)
    })
  }
  return Promise.resolve()
}

handleOptions()
  .then(() => (
    createTempDirectory()
  ))
  .then(directoryName => {
    tempDirectoryName = directoryName
    return readSrcDirectory()
  })
  .then(files => {
    const filteredFiles = clearFilesList(
      files,
      [tempDirectoryName].concat(options.files)
    )
    return copyFiles(filteredFiles, tempDirectoryName)
  })
  .then(() => (
    readPackageJSON()
  ))
  .then(packageJson => {
    const cleanPackageJSON = clearPackageJSON(packageJson, options.fields)
    return writePackageJSON(tempDirectoryName, cleanPackageJSON)
  })
  .then(() => {
    if (options.beforeScript) {
      return runScript(options.beforeScript, tempDirectoryName)
    } else {
      return true
    }
  })
  .then(isPrepublishSuccess => {
    if (!options.withoutPublish && isPrepublishSuccess) {
      return publish(tempDirectoryName, options.packageManager, options.access)
    }
  })
  .then(() => {
    if (!options.withoutPublish) {
      return removeTempDirectory(tempDirectoryName)
    }
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
