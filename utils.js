import { promises as fs } from "fs"
import fse from 'fs-extra'

export const mkdtemp = fs.mkdtemp
export const readdir = fs.readdir

export function regExpIndexOf (array, item) {
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

export const remove = fse.remove
export const readJson = fse.readJSON
export const writeJson = fse.writeJSON
export const copy = fse.copy

export function multiCp (files) {
  return Promise.all(files.map(({ from, to }) => fse.copy(from, to)))
}

export function readJsonFromStdin () {
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

export function parseListArg(arg) {
  return arg.split(/,\s*/)
}

export function isObject(object) {
  return object && typeof object === 'object'
}
