#!/usr/bin/env node

const fs = require('fs');
const fse = require('fs-extra');
const omit = require('lodash.omit');
const IGNORE_FILES = require('./ignore-files');
const IGNORE_FIELDS = require('./ignore-fields');

(function () {
  const tmp = fs.mkdtempSync('tmp');
  const src = './'
  const packageJSON = 'package.json'
  fs.readdirSync(src).forEach(i => {
    if (i !== tmp) {
      if (IGNORE_FILES.indexOf(i) == -1 || fs.statSync(i).isDirectory()) {
        fse.copy(i, `${tmp}/${i}`)
          .then(() => {
            if (i === packageJSON) {
              fse.readJson(packageJSON, (err, obj) => {
                fse.writeJsonSync(`./${tmp}/${packageJSON}`, omit(obj, IGNORE_FIELDS), {
                  spaces: 2
                })
              })
            }
          });
      }
    }
  })
})();