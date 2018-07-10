const fs = require('fs');
const fse = require('fs-extra');
const CONFIG_FILES_LIST = require('./config-files-list');

function cleanPublish() {
  const tmp = './tmp';
  fs.mkdirSync(tmp);
  fs.readdirSync('./').forEach(i => {
    if (i !== 'tmp') {
      if (!CONFIG_FILES_LIST.includes(i)) {
        fs.copyFileSync(i, `${tmp}/${i}`);
      }
      if (fs.statSync(i).isDirectory()) {
        fse.copy(i, `${tmp}/${i}`);
      }
    }
  });
};

cleanPublish();
