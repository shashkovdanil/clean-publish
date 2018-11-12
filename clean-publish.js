#!/usr/bin/env node

const chalk = require('chalk')
const yargs = require('yargs')
const {
  createTempDirectory,
  readSrcDirectory,
  clearFilesList,
  copyFiles,
  readPackageJSON,
  clearPackageJSON,
  writePackageJSON,
  publish,
  removeTempDirectory
} = require('./core')
const getConfig = require('./get-config')

const { argv } = yargs
  .usage('$0')
  .option('files', {
    type: 'array',
    desc: 'One or more exclude files'
  })
  .option('fields', {
    type: 'array',
    desc: 'One or more exclude package.json fields'
  })
  .option('without-publish', {
    type: 'boolean',
    desc: 'Clean package without npm publish'
  })
  .option('package-manager', {
    types: 'string',
    default: 'npm',
    desc: 'Package manager to use'
  })

const options = {}
let tempDirectoryName

function handleOptions () {
  Object.assign(options, argv, {
    withoutPublish: argv['without-publish'],
    packageManager: argv['package-manager']
  })
  if (options['_'].length === 0) {
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
    if (!options.withoutPublish) {
      return publish(tempDirectoryName, options.packageManager)
    }
  })
  .then(() => {
    if (!options.withoutPublish) {
      return removeTempDirectory(tempDirectoryName)
    }
  })
  .catch(error => {
    console.error(chalk.red(error))
    process.exit()
  })
