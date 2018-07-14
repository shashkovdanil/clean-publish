const fse = require('fs-extra')

function regExpIndexOf (array, item) {
  for (const i in array) {
    if (typeof array[i] === 'string' && item === array[i]) {
      return true
    }
    if (array[i] instanceof RegExp && array[i].test(item)) {
      return true
    }
  }
  return false
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
