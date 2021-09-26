const { readFile, writeFile } = require('fs/promises')
const spawn = require('cross-spawn')
const path = require('path')

const {
  regExpIndexOf,
  multiCp,
  writeJson,
  readJson,
  readdir,
  mkdtemp,
  remove
} = require('./utils')
const IGNORE_FILES = require('./exception/ignore-files')
const IGNORE_FIELDS = require('./exception/ignore-fields')
const NPM_SCRIPTS = require('./exception/npm-scripts')

function readPackageJSON () {
  return readJson('package.json')
}

function writePackageJSON (directoryName, packageJSON) {
  return writeJson(path.join(directoryName, 'package.json'), packageJSON, {
    spaces: 2
  })
}

function clearPackageJSON (packageJson, inputIgnoreFields) {
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

function clearFilesList (files, inputIgnoreFiles) {
  const ignoreFiles = inputIgnoreFiles
    ? IGNORE_FILES.concat(inputIgnoreFiles)
    : IGNORE_FILES
  const filteredFiles = files.filter(
    file => regExpIndexOf(ignoreFiles, file) === false
  )
  return filteredFiles
}

function publish (cwd, packageManager, access, tag) {
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

function readSrcDirectory () {
  return readdir('./')
}

function createTempDirectory () {
  return mkdtemp('tmp')
}

function removeTempDirectory (directoryName) {
  return remove(directoryName)
}

function copyFiles (files, drectoryName) {
  return multiCp(
    files.map(file => ({
      from: path.join('./', file),
      to: path.join(drectoryName, file)
    }))
  )
}

function runScript (script, ...args) {
  return new Promise((resolve, reject) => {
    spawn(script, args, { stdio: 'inherit' })
      .on('close', code => {
        resolve(code === 0)
      })
      .on('error', reject)
  })
}

function cleanDocs (drectoryName, repository) {
  let readmePath = path.join(drectoryName, 'README.md')
  return readFile(readmePath).then(readme => {
    let name = repository.match(/[^/]+\/[^/]+$/)
    const cleaned = readme.toString().split(/\n##\s*\w/m)[0] +
      '\n## Docs\n' +
      `Read **[full docs](https://github.com/${name}#readme)** on GitHub.\n`
    return writeFile(readmePath, cleaned)
  })
}

module.exports = {
  readPackageJSON,
  writePackageJSON,
  clearPackageJSON,
  clearFilesList,
  publish,
  readSrcDirectory,
  createTempDirectory,
  removeTempDirectory,
  copyFiles,
  runScript,
  cleanDocs
}
