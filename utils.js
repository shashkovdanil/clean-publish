const { mkdtemp, readdir } = require('fs').promises
const { copy, remove, readJson, writeJson } = require('fs-extra')

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
