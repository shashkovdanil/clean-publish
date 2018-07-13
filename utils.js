const fse = require('fs-extra')

function regExpIndexOf (array, item) {
  for (const i in array) {
    if (array[i].toString().match(item)) {
      return i
    }
  }
  return -1
}

function cp (file) {
  return new Promise((resolve, reject) => {
    fse.copy(file.from, file.to, err => (err ? reject(err) : resolve()))
  })
}

function multiCp (files) {
  return Promise.all(files.map(file => cp(file)))
}

module.exports = {
  regExpIndexOf,
  multiCp
}
