const promisify = require('util.promisify/polyfill')()
const fs = require('fs')
const fse = require('fs-extra')

const mkdtemp = promisify(fs.mkdtemp)
const readdir = promisify(fs.readdir)
const copy = fse.copy
const remove = fse.remove
const readJson = fse.readJson
const writeJson = fse.writeJson

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
