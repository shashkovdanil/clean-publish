#!/usr/bin/env node

const chalk = require('chalk')
const fs = require('fs')
const fse = require('fs-extra')
const omit = require('lodash.omit')
const { spawn } = require('child_process')

const IGNORE_FILES = require('./ignore-files')
const IGNORE_FIELDS = require('./ignore-fields');

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
          for (let i = 0; i < IGNORE_FILES.length; i += 1) {
            return file.search(IGNORE_FILES[0]) === -1
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
                  fse.writeJson(
                    `./${ tmpDir }/${ packageJSON }`,
                    omit(obj, IGNORE_FIELDS), {
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
