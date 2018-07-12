#!/usr/bin/env node

const chalk = require('chalk')
const fs = require('fs')
const os = require('os')
const { spawn } = require('child_process')
const fse = require('fs-extra')
const omit = require('lodash.omit')
const pick = require('lodash.pick')
const yargs = require('yargs')

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
  function regExpIndexOf (array, item) {
    for (const i in array) {
      if (array[i].toString().match(item)) {
        return i
      }
    }
    return -1
  };
  const src = './'
  const packageJSON = 'package.json'
  const npmScript = os.type().indexOf('Windows') !== -1 ? 'npm.cmd' : 'npm'
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
      files
        .forEach(file => {
          if (file !== tmpDir) {
            if (regExpIndexOf(ignoreFiles, file) === -1) {
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
                    const modifiedPackageJSON = Object.assign(
                      omit(obj, ignoreFields),
                      {
                        scripts: pick(obj.scripts, NPM_SCRIPTS)
                      }
                    )
                    fse.writeJson(
                      `./${ tmpDir }/${ packageJSON }`,
                      modifiedPackageJSON,
                      { spaces: 2 }
                    )
                  })
                }
              })
            }
          }
        })
    })
    process.chdir(tmpDir)
    const publish = spawn(npmScript, ['publish'], {
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
