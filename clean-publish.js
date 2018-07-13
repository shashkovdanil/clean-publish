#!/usr/bin/env node

const chalk = require('chalk')
const fs = require('fs')
const spawn = require('cross-spawn')
const fse = require('fs-extra')
const omit = require('lodash.omit')
const pick = require('lodash.pick')
const yargs = require('yargs')
const { regExpIndexOf, multiCp } = require('./utils')

const IGNORE_FILES = require('./ignore-files')
const IGNORE_FIELDS = require('./ignore-fields')
const NPM_SCRIPTS = require('./npm-scripts')

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
      const ignoreFiles = argv.files
        ? IGNORE_FILES.concat(argv.files)
        : IGNORE_FILES
      const filteredFiles = files.filter(file => (
        file !== tmpDir && regExpIndexOf(ignoreFiles, file) === -1
      ))
      multiCp(filteredFiles.map(file => ({
        from: `${ src }${ file }`,
        to: `${ tmpDir }/${ file }`
      })))
        .then(() => {
          fse.readJson(packageJSON, (err, obj) => {
            if (err) {
              console.error(chalk.red(err))
              process.exit()
            }
            const ignoreFields = argv.fields
              ? IGNORE_FIELDS.concat(argv.fields)
              : IGNORE_FIELDS
            const modifiedPackageJSON = Object.assign(
              omit(obj, ignoreFields),
              {
                scripts: pick(obj.scripts, NPM_SCRIPTS)
              }
            )
            fse.writeJson(
              `./${ tmpDir }/${ packageJSON }`,
              modifiedPackageJSON,
              { spaces: 2 },
              writePackageJSONErr => {
                if (writePackageJSONErr) {
                  console.error(chalk.red(writePackageJSONErr))
                  process.exit()
                }
                spawn('npm', ['publish'], {
                  stdio: 'inherit',
                  cwd: tmpDir
                }).on('close', () => {
                  fse.remove(tmpDir, removeTmpDirErr => {
                    if (removeTmpDirErr) {
                      console.error(chalk.red(removeTmpDirErr))
                      process.exit()
                    }
                  })
                })
              }
            )
          })
        })
        .catch(copyErr => {
          console.error(chalk.red(copyErr))
          process.exit()
        })
    })
  })
})()
