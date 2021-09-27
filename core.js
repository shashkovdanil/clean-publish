import { promises as fs } from "fs"
import spawn from 'cross-spawn'
import { join } from 'path'

import {
  regExpIndexOf,
  multiCp,
  writeJson,
  readJson,
  readdir,
  mkdtemp,
  remove
} from './utils.js'
import IGNORE_FILES from './exception/ignore-files.js'
import IGNORE_FIELDS from './exception/ignore-fields.js'
import NPM_SCRIPTS from './exception/npm-scripts.js'

export function readPackageJSON () {
  return readJson('package.json')
}

export function writePackageJSON (directoryName, packageJSON) {
  return writeJson(join(directoryName, 'package.json'), packageJSON, {
    spaces: 2
  })
}

export function clearPackageJSON (packageJson, inputIgnoreFields) {
  const ignoreFields = inputIgnoreFields
    ? IGNORE_FIELDS.concat(inputIgnoreFields)
    : IGNORE_FIELDS
  const cleanPackageJSON = {}
  for (const key in packageJson) {
    if (!ignoreFields.includes(key) && key !== 'scripts') {
      cleanPackageJSON[key] = packageJson[key]
    }
  }
  if (packageJson.scripts && !ignoreFields.includes('scripts')) {
    cleanPackageJSON.scripts = {}
    for (const script in packageJson.scripts) {
      if (NPM_SCRIPTS.includes(script)) {
        cleanPackageJSON.scripts[script] = packageJson.scripts[script]
      }
    }
  }

  for (const i in cleanPackageJSON) {
    if (typeof cleanPackageJSON[i] === 'object') {
      if (Object.keys(cleanPackageJSON[i]).length === 0) {
        delete cleanPackageJSON[i]
      }
    }
  }
  return cleanPackageJSON
}

export function clearFilesList (files, inputIgnoreFiles) {
  const ignoreFiles = inputIgnoreFiles
    ? IGNORE_FILES.concat(inputIgnoreFiles)
    : IGNORE_FILES
  const filteredFiles = files.filter(
    file => regExpIndexOf(ignoreFiles, file) === false
  )
  return filteredFiles
}

export function publish (cwd, packageManager, access, tag) {
  return new Promise((resolve, reject) => {
    const args = ['publish']
    if (access) args.push('--access', access)
    if (tag) args.push('--tag', tag)
    spawn(packageManager, args, {
      stdio: 'inherit',
      cwd
    })
      .on('close', (code, signal) => {
        resolve({
          code,
          signal
        })
      })
      .on('error', reject)
  })
}

export function readSrcDirectory () {
  return readdir('./')
}

export function createTempDirectory () {
  return mkdtemp('tmp')
}

export function removeTempDirectory (directoryName) {
  return remove(directoryName)
}

export function copyFiles (files, drectoryName) {
  return multiCp(
    files.map(file => ({
      from: join('./', file),
      to: join(drectoryName, file)
    }))
  )
}

export function runScript (script, ...args) {
  return new Promise((resolve, reject) => {
    spawn(script, args, { stdio: 'inherit' })
      .on('close', code => {
        resolve(code === 0)
      })
      .on('error', reject)
  })
}

export async function cleanDocs (drectoryName, repository) {
  let readmePath = join(drectoryName, 'README.md')
  let readme = await fs.readFile(readmePath)
  if (repository) {
    let name = repository.match(/[^/]+\/[^/]+$/)
    const cleaned = readme.toString().split(/\n##\s*\w/m)[0] +
      '\n## Docs\n' +
      `Read **[full docs](https://github.com/${name}#readme)** on GitHub.\n`
    await fs.writeFile(readmePath, cleaned)
  }
}
