import spawn from 'cross-spawn'
import glob from 'fast-glob'
import micromatch from 'micromatch'
import { promises as fs } from 'node:fs'
import { basename, join } from 'node:path'

import IGNORE_FIELDS from './exception/ignore-fields.js'
import IGNORE_FILES from './exception/ignore-files.js'
import NPM_SCRIPTS from './exception/npm-scripts.js'
import {
  copy,
  filterObjectByKey,
  isObject,
  readJSON,
  remove,
  writeJSON
} from './utils.js'

// https://pnpm.io/package_json#publishconfig
const PUBLISH_CONFIG_FIELDS = [
  'bin',
  'main',
  'exports',
  'types',
  'typings',
  'module',
  'browser',
  'esnext',
  'es2015',
  'unpkg',
  'umd:main',
  'typesVersions',
  'cpu',
  'os'
]

export function readPackageJSON() {
  return readJSON('package.json')
}

export function writePackageJSON(directoryName, packageJSON) {
  return writeJSON(join(directoryName, 'package.json'), packageJSON)
}

function applyPublishConfig(packageJson) {
  if (!packageJson.publishConfig) {
    return packageJson
  }

  const publishConfig = {
    ...packageJson.publishConfig
  }

  PUBLISH_CONFIG_FIELDS.forEach(field => {
    if (publishConfig[field]) {
      packageJson[field] = publishConfig[field]
      delete publishConfig[field]
    }
  })

  if (!Object.keys(publishConfig).length) {
    // delete property by destructuring
    // eslint-disable-next-line no-unused-vars
    const { publishConfig: _, ...pkg } = packageJson

    return pkg
  }

  return {
    ...packageJson,
    publishConfig
  }
}

export function clearPackageJSON(packageJson, inputIgnoreFields) {
  const ignoreFields = inputIgnoreFields
    ? IGNORE_FIELDS.concat(inputIgnoreFields)
    : IGNORE_FIELDS
  const cleanPackageJSON = filterObjectByKey(
    applyPublishConfig(packageJson),
    key => !ignoreFields.includes(key) && key !== 'scripts'
  )

  if (packageJson.scripts && !ignoreFields.includes('scripts')) {
    cleanPackageJSON.scripts = filterObjectByKey(packageJson.scripts, script =>
      NPM_SCRIPTS.includes(script)
    )

    if (
      cleanPackageJSON.scripts.publish &&
      /^clean-publish( |$)/.test(cleanPackageJSON.scripts.publish)
    ) {
      // "custom" publish script is actually calling clean-publish
      delete cleanPackageJSON.scripts.publish
    }
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

export function createIgnoreMatcher(ignorePattern) {
  if (ignorePattern instanceof RegExp) {
    return filename => !ignorePattern.test(filename)
  }

  if (glob.isDynamicPattern(ignorePattern)) {
    const isMatch = micromatch.matcher(ignorePattern)

    return (_filename, path) => !isMatch(path)
  }

  return filename => filename !== ignorePattern
}

export function createFilesFilter(ignoreFiles) {
  const ignorePatterns = ignoreFiles
    ? IGNORE_FILES.concat(ignoreFiles).filter(Boolean)
    : IGNORE_FILES
  const filter = ignorePatterns.reduce((next, ignorePattern) => {
    const ignoreMatcher = createIgnoreMatcher(ignorePattern)

    if (!next) {
      return ignoreMatcher
    }

    return (filename, path) =>
      ignoreMatcher(filename, path) && next(filename, path)
  }, null)

  return path => {
    const filename = basename(path)

    return filter(filename, path)
  }
}

export async function copyFiles(tempDir, filter) {
  const rootFiles = await fs.readdir('./')

  return Promise.all(
    rootFiles.map(async file => {
      if (file !== tempDir) {
        await copy(file, join(tempDir, file), { filter })
      }
    })
  )
}

export function publish(
  cwd,
  { access, dryRun, packageManager, packageManagerOptions = [], tag }
) {
  return new Promise((resolve, reject) => {
    const args = ['publish', ...packageManagerOptions]
    if (access) args.push('--access', access)
    if (tag) args.push('--tag', tag)
    if (dryRun) args.push('--dry-run')
    spawn(packageManager, args, {
      cwd,
      stdio: 'inherit'
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

  return await fs.mkdtemp('tmp')
}

export function removeTempDirectory(directoryName) {
  return remove(directoryName)
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
  const repoUrl = typeof repository === 'object' ? repository.url : repository
  if (repoUrl) {
    const name = repoUrl.match(/[^/:]+\/[^/:]+$/)?.[0]?.replace(/\.git$/, '')
    return `https://github.com/${name}#readme`
  }

  return null
}

export async function cleanDocs(drectoryName, repository, homepage) {
  const readmePath = join(drectoryName, 'README.md')
  const readme = await fs.readFile(readmePath)
  const readmeUrl = getReadmeUrlFromRepository(repository)
  if (homepage || readmeUrl) {
    const cleaned =
      readme.toString().split(/\n##\s*\w/m)[0] +
      '\n## Docs\n' +
      `Read full docs **[here](${homepage || readmeUrl})**.\n`
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
        .replace(/\s*\/\*[^/]+\*\/\n?/gm, '\n')
        .replace(/\n+/gm, '\n')
        .replace(/^\n+/gm, '')
      await fs.writeFile(file, cleaned)
    })
  )
}
