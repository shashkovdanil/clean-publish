#!/usr/bin/env node

var fs = require('fs');
var fse = require('fs-extra');
var CONFIG_FILES_LIST = require('./config-files-list');

(function() {
  var tmp = './tmp';
  fs.mkdirSync(tmp);
  fs.readdirSync('./').forEach(function(i) {
    if (i !== 'tmp') {
      if (CONFIG_FILES_LIST.indexOf(i) == -1 || fs.statSync(i).isDirectory()) {
        fse.copy(i, `${tmp}/${i}`);
      }
    }
  });
})();
