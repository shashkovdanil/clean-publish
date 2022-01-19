import { promises as fs } from 'fs'
import { join, basename } from 'path'
import spawn from 'cross-spawn'
import glob from 'fast-glob'
import micromatch from 'micromatch'

import {
  writeJson,
  readJson,
  readdir,
  mkdtemp,
  copy,
  remove,
  isObject,
  filterObjectByKey
} from './utils.js'
import IGNORE_FILES from './exception/ignore-files.js'
import IGNORE_FIELDS from './exception/ignore-fields.js'
import NPM_SCRIPTS from './exception/npm-scripts.js'

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
  'cpu',
  'os'
]

export function readPackageJSON() {
  return readJson('package.json')
}

export function writePackageJSON(directoryName, packageJSON) {
  return writeJson(join(directoryName, 'package.json'), packageJSON, {
    spaces: 2
  })
}

function applyPublishConfig(packageJson) {
  if (!packageJson.publishConfig) {
    return
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
    delete packageJson.publishConfig
  } else {
    packageJson.publishConfig = publishConfig
  }
}

export function clearPackageJSON(packageJson, inputIgnoreFields) {
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
      (cleanPackageJSON.scripts.publish === 'clean-publish' ||
        cleanPackageJSON.scripts.publish.startsWith('clean-publish '))
    ) {
      // "custom" publish script is actually calling clean-publish
      delete cleanPackageJSON.scripts.publish
    }
  }

  applyPublishConfig(cleanPackageJSON)

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
  const rootFiles = await readdir('./')

  return Promise.all(
    rootFiles.map(async file => {
      if (file !== tempDir) {
        await copy(file, join(tempDir, file), {
          filter
        })
      }
    })
  )
}

export function publish(
  cwd,
  { packageManager, packageManagerOptions = [], access, tag, dryRun }
) {
  return new Promise((resolve, reject) => {
    const args = ['publish', ...packageManagerOptions]
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
