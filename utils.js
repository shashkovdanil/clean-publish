const util = require('util')
const fs = require('fs')
const fse = require('fs-extra')

const mkdtemp = util.promisify(fs.mkdtemp)
const readdir = util.promisify(fs.readdir)
const copy = util.promisify(fse.copy)
const remove = util.promisify(fse.remove)
const readJson = util.promisify(fse.readJson)
const writeJson = util.promisify(fse.writeJson)

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

function multiCp (files) {
  return Promise.all(
    files.map(({ from, to }) => copy(from, to))
  )
}

module.exports = {
  mkdtemp,
  readdir,
  copy,
  remove,
  readJson,
  writeJson,
  regExpIndexOf,
  multiCp
}
