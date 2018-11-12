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

const withoutPublish = argv['without-publish']
let tempDirectoryName

createTempDirectory()
  .then(directoryName => {
    tempDirectoryName = directoryName
    return readSrcDirectory()
  })
  .then(files => {
    const filteredFiles = clearFilesList(
      files,
      [tempDirectoryName].concat(argv.files)
    )
    return copyFiles(filteredFiles, tempDirectoryName)
  })
  .then(() => (
    readPackageJSON()
  ))
  .then(packageJson => {
    const cleanPackageJSON = clearPackageJSON(packageJson, argv.fields)
    return writePackageJSON(tempDirectoryName, cleanPackageJSON)
  })
  .then(() => {
    if (!withoutPublish) {
      return publish(tempDirectoryName, argv['package-manager'])
    }
  })
  .then(() => (
    !withoutPublish && removeTempDirectory(tempDirectoryName)
  ))
  .catch(error => {
    console.error(chalk.red(error))
    process.exit()
  })
