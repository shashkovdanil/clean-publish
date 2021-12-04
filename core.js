import { promises as fs } from 'fs'
import { join } from 'path'
import spawn from 'cross-spawn'
import glob from 'fast-glob'
import hostedGitInfo from 'hosted-git-info'

import {
  regExpIndexOf,
  multiCp,
  writeJson,
  readJson,
  readdir,
  mkdtemp,
  remove,
  isObject,
  filterObjectByKey
} from './utils.js'
import IGNORE_FILES from './exception/ignore-files.js'
import IGNORE_FIELDS from './exception/ignore-fields.js'
import NPM_SCRIPTS from './exception/npm-scripts.js'

export function readPackageJSON() {
  return readJson('package.json')
}

export function writePackageJSON(directoryName, packageJSON) {
  return writeJson(join(directoryName, 'package.json'), packageJSON, {
    spaces: 2
  })
}

export function clearPackageJSON(
  packageJson,
  inputIgnoreFields,
  ignoreExports
) {
  const ignoreFields = inputIgnoreFields
    ? IGNORE_FIELDS.concat(inputIgnoreFields)
    : IGNORE_FIELDS
  const cleanPackageJSON = filterObjectByKey(
    packageJson,
    key => !ignoreFields.includes(key) && key !== 'scripts'
  )

  if (packageJson.scripts && !ignoreFields.includes('scripts')) {
    cleanPackageJSON.scripts = filterObjectByKey(packageJson.scripts, script =>
      NPM_SCRIPTS.includes(script)
    )

    if (
      cleanPackageJSON.scripts.publish &&
      cleanPackageJSON.scripts.publish.startsWith('clean-publish')
    ) {
      // "custom" publish script is actually calling clean-publish
      delete cleanPackageJSON.scripts.publish
    }
  }

  if (isObject(packageJson.exports) && !ignoreFields.includes('exports')) {
    const exportsFilter =
      ignoreExports && (condition => !ignoreExports.includes(condition))
    cleanPackageJSON.exports = filterObjectByKey(
      packageJson.exports,
      exportsFilter,
      true
    )
  }

  for (const i in cleanPackageJSON) {
    if (
      isObject(cleanPackageJSON[i]) &&
      Object.keys(cleanPackageJSON[i]).length === 0
    ) {
      delete cleanPackageJSON[i]
    }
  }
  return cleanPackageJSON
}

export function clearFilesList(files, inputIgnoreFiles) {
  const ignoreFiles = inputIgnoreFiles
    ? IGNORE_FILES.concat(inputIgnoreFiles)
    : IGNORE_FILES
  const filteredFiles = files.filter(
    file => regExpIndexOf(ignoreFiles, file) === false
  )
  return filteredFiles
}

export function publish(cwd, { packageManager, access, tag, dryRun }) {
  return new Promise((resolve, reject) => {
    const args = ['publish']
    if (access) args.push('--access', access)
    if (tag) args.push('--tag', tag)
    if (dryRun) args.push('--dry-run')
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

export function readSrcDirectory() {
  return readdir('./')
}

export async function createTempDirectory(name) {
  if (name) {
    try {
      await fs.mkdir(name)
    } catch (err) {
      if (err.code === 'EEXIST') {
        throw new Error(`Temporary directory "${name}" already exists.`)
      }
    }

    return name
  }

  return await mkdtemp('tmp')
}

export function removeTempDirectory(directoryName) {
  return remove(directoryName)
}

export function copyFiles(files, drectoryName) {
  return multiCp(
    files.map(file => ({
      from: join('./', file),
      to: join(drectoryName, file)
    }))
  )
}

export function runScript(script, ...args) {
  return new Promise((resolve, reject) => {
    spawn(script, args, { stdio: 'inherit' })
      .on('close', code => {
        resolve(code === 0)
      })
      .on('error', reject)
  })
}

export function getReadmeUrlFromRepository(repository) {
  const repoUrl =
    typeof repository === 'string' ? repository : repository && repository.url
  if (repoUrl) return hostedGitInfo.fromUrl(repoUrl).docs()

  return null
}

export async function cleanDocs(drectoryName, repository) {
  const readmePath = join(drectoryName, 'README.md')
  const readme = await fs.readFile(readmePath)
  const readmeUrl = getReadmeUrlFromRepository(repository)
  if (readmeUrl) {
    const cleaned =
      readme.toString().split(/\n##\s*\w/m)[0] +
      '\n## Docs\n' +
      `Read **[full docs](${readmeUrl})** on GitHub.\n`
    await fs.writeFile(readmePath, cleaned)
  }
}

export async function cleanComments(drectoryName) {
  const files = await glob(['**/*.js'], { cwd: drectoryName })
  await Promise.all(
    files.map(async i => {
      const file = join(drectoryName, i)
      const content = await fs.readFile(file)
      const cleaned = content
        .toString()
        .replace(/\s*\/\/.*\n/gm, '\n')
        .replace(/\n+/gm, '\n')
        .replace(/^\n+/gm, '')
      await fs.writeFile(file, cleaned)
    })
  )
}
