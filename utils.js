import { promises as fs } from 'fs'

export const mkdtemp = fs.mkdtemp
export const readdir = fs.readdir

export async function remove(dir) {
  await fs.rm(dir, { recursive: true, force: true })
}

export async function copy(from, to, opts) {
  await fs.cp(from, to, { recursive: true, ...opts })
}

export async function readJSON(file) {
  let data = await fs.readFile(file)
  return JSON.parse(data.toString())
}

export async function writeJSON(file, json) {
  await fs.writeFile(file, JSON.stringify(json, null, '  ') + '\n')
}

export function readJSONFromStdin() {
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
  return arg.trim().split(/\s*,\s*/)
}

export function isObject(object) {
  return Boolean(object) && typeof object === 'object'
}

export function filterObjectByKey(object, filterByKey = () => true, deep) {
  let result = {}
  let changed = false

  for (const key in object) {
    if (filterByKey(key)) {
      if (deep && isObject(object[key])) {
        result[key] = filterObjectByKey(object[key], filterByKey, deep)

        if (result[key] !== object[key]) {
          changed = true
        }
      } else {
        result[key] = object[key]
      }
    } else {
      changed = true
    }
  }

  return changed ? result : object
}
