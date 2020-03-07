const path = require('path')
const spawn = require('cross-spawn')
const {
  omit,
  pick
} = require('ramda')
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
  return writeJson(
    path.join(directoryName, 'package.json'),
    packageJSON,
    { spaces: 2 }
  )
}

function clearPackageJSON (packageJson, inputIgnoreFields) {
  const ignoreFields = inputIgnoreFields
    ? IGNORE_FIELDS.concat(inputIgnoreFields)
    : IGNORE_FIELDS
  let clearedScripts = { }
  if (packageJson.scripts) {
    clearedScripts = {
      scripts: pick(NPM_SCRIPTS, packageJson.scripts)
    }
  }
  const cleanPackageJSON = omit(ignoreFields, Object.assign(
    {},
    packageJson,
    clearedScripts
  ))

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
  const filteredFiles = files.filter(file => (
    regExpIndexOf(ignoreFiles, file) === false
  ))
  return filteredFiles
}

function publish (cwd, packageManager, access) {
  return new Promise((resolve, reject) => {
    const args = access
      ? ['publish', '--access', access]
      : ['publish']
    spawn(packageManager, args, {
      stdio: 'inherit',
      cwd
    }).on('close', (code, signal) => {
      resolve({
        code,
        signal
      })
    }).on('error', reject)
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
  return multiCp(files.map(file => ({
    from: path.join('./', file),
    to: path.join(drectoryName, file)
  })))
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
  runScript
}
