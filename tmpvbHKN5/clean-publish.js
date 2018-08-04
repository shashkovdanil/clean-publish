#!/usr/bin/env node

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')
const fse = require('fs-extra')
const { omit, pick } = require('ramda')
const yargs = require('yargs')
const { regExpIndexOf, multiCp } = require('./utils')

const IGNORE_FILES = require('./exception/ignore-files')
const IGNORE_FIELDS = require('./exception/ignore-fields')
const NPM_SCRIPTS = require('./exception/npm-scripts')

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

function removeTempDirectory (tempDirectoryName) {
  fse.remove(tempDirectoryName, error => {
    if (error) {
      console.error(chalk.red(error))
      process.exit()
    }
  })
}

function clearPackageJSON (tempDirectoryName, cleanPackageJSON) {
  fse.writeJson(
    path.join(tempDirectoryName, 'package.json'),
    cleanPackageJSON,
    { spaces: 2 },
    error => {
      if (error) {
        console.error(chalk.red(error))
        process.exit()
      }
      if (!argv['without-publish']) {
        spawn('npm', ['publish'], {
          stdio: 'inherit',
          cwd: tempDirectoryName
        }).on('close', () => {
          removeTempDirectory()
        })
      }
    }
  )
}

function readPackageJSON (tempDirectoryName) {
  fse.readJson('package.json', (error, content) => {
    if (error) {
      console.error(chalk.red(error))
      process.exit()
    }
    const ignoreFields = argv.fields
      ? IGNORE_FIELDS.concat(argv.fields)
      : IGNORE_FIELDS
    const clearedScripts = {
      scripts: pick(NPM_SCRIPTS, content.scripts)
    }
    const cleanPackageJSON = Object.assign(
      omit(ignoreFields, content),
      clearedScripts
    )
    for (const i in cleanPackageJSON) {
      if (typeof cleanPackageJSON[i] === 'object') {
        if (Object.keys(cleanPackageJSON[i]).length === 0) {
          delete cleanPackageJSON[i]
        }
      }
    }
    clearPackageJSON(tempDirectoryName, cleanPackageJSON)
  })
}

function copyFiles (files, tempDirectoryName) {
  multiCp(files.map(file => ({
    from: path.join('./', file),
    to: path.join(tempDirectoryName, file)
  })))
    .then(() => {
      readPackageJSON(tempDirectoryName)
    })
    .catch(error => {
      console.error(chalk.red(error))
      process.exit()
    })
}

function readSrcDirectory (tempDirectoryName) {
  fs.readdir('./', (error, files) => {
    if (error) {
      console.error(chalk.red(error))
      process.exit()
    }
    const ignoreFiles = argv.files
      ? IGNORE_FILES.concat(argv.files)
      : IGNORE_FILES
    const filteredFiles = files.filter(file => (
      file !== tempDirectoryName && regExpIndexOf(ignoreFiles, file) === false
    ))
    copyFiles(filteredFiles, tempDirectoryName)
  })
}

function createTempDirectory () {
  fs.mkdtemp('tmp', (error, name) => {
    if (error) {
      console.error(chalk.red(error))
      process.exit()
    }
    readSrcDirectory(name)
  })
}

createTempDirectory()
