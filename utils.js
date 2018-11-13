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

function readJsonFromStdin () {
  process.stdin.setEncoding('utf8')
  return new Promise((resolve, reject) => {
    let jsonString = ''
    process.stdin
      .on('readable', () => {
        const chunk = process.stdin.read()
        if (typeof chunk === 'string') {
          jsonString += chunk
        }
      })
      .on('end', () => {
        try {
          const json = JSON.parse(jsonString)
          resolve(json)
        } catch (error) {
          reject(error)
        }
      })
      .on('error', reject)
  })
}

module.exports = {
  mkdtemp,
  readdir,
  copy,
  remove,
  readJson,
  readJsonFromStdin,
  writeJson,
  regExpIndexOf,
  multiCp
}
