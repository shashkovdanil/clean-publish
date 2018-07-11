#!/usr/bin/env node

const chalk = require('chalk')
const fs = require('fs')
const { spawn } = require('child_process')
const fse = require('fs-extra')
const omit = require('lodash.omit')
const yargs = require('yargs')

const IGNORE_FILES = require('./ignore-files')
const IGNORE_FIELDS = require('./ignore-fields')

const { argv } = yargs
  .usage('$0')
  .option('files', {
    type: 'array',
    desc: 'One or more exclude files'
  })
  .option('fields', {
    type: 'array',
    desc: 'One or more exclude package.json fields'
  });

(function () {
  const src = './'
  const packageJSON = 'package.json'
  fs.mkdtemp('tmp', (makeTmpDirErr, tmpDir) => {
    if (makeTmpDirErr) {
      console.error(chalk.red(makeTmpDirErr))
      process.exit()
    }
    fs.readdir(src, (readSrcDirErr, files) => {
      if (readSrcDirErr) {
        console.error(chalk.red(readSrcDirErr))
        process.exit()
      }
      files
        .filter(file => {
          const ignoreFiles = argv.files
            ? IGNORE_FILES.concat(argv.files)
            : IGNORE_FILES
          for (let i = 0; i < ignoreFiles.length; i += 1) {
            return file.search(ignoreFiles[i]) === -1
          }
          return null
        })
        .forEach(file => {
          if (file !== tmpDir) {
            fse.copy(file, `${ tmpDir }/${ file }`, copyErr => {
              if (copyErr) {
                console.error(chalk.red(copyErr))
                process.exit()
              }
              if (file === packageJSON) {
                fse.readJson(packageJSON, (err, obj) => {
                  if (err) {
                    console.error(chalk.red(err))
                    process.exit()
                  }
                  const ignoreFields = argv.fields
                    ? IGNORE_FIELDS.concat(argv.fields)
                    : IGNORE_FIELDS
                  fse.writeJson(
                    `./${ tmpDir }/${ packageJSON }`,
                    omit(obj, ignoreFields), {
                      spaces: 2
                    })
                })
              }
            })
          }
        })
    })
    process.chdir(tmpDir)
    const publish = spawn('npm', ['publish'], {
      stdio: 'inherit'
    })
    publish.on('exit', () => {
      fse.remove(tmpDir, removeTmpDirErr => {
        if (removeTmpDirErr) {
          console.error(chalk.red(removeTmpDirErr))
          process.chdir('../')
          process.exit()
        }
      })
    })
    process.chdir('../')
  })
})()
