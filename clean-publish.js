#!/usr/bin/env node

const fs = require('fs');
const fse = require('fs-extra');
const omit = require('lodash.omit');
const { spawn } = require('child_process');

const IGNORE_FILES = require('./ignore-files');
const IGNORE_FIELDS = require('./ignore-fields');

(function () {
  const src = './'
  const packageJSON = 'package.json'
  fs.mkdtemp('tmp', (err, tmpDir) => {
    fs.readdir(src, (err, files) => {
      files
        .filter((file) => {
          for (let i = 0; i < IGNORE_FILES.length; i += 1) {
            return file.search(IGNORE_FILES[0]) === -1
          }
        })
        .forEach(file => {
          fse.copy(file, `${tmpDir}/${file}`, (err) => {
            if (file === packageJSON) {
              fse.readJson(packageJSON, (err, obj) => {
                fse.writeJson(`./${tmpDir}/${packageJSON}`, omit(obj, IGNORE_FIELDS), {
                  spaces: 2
                })
              })
            }
          })
        })
    })
    process.chdir(tmpDir);
    const publish = spawn('npm', ['publish'], {
      stdio: 'inherit'
    });
    publish.on('exit', () => {
      fse.remove(tmpDir);
    })
    process.chdir('../');
  })
})();
