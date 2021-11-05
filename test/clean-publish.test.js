import { fileURLToPath } from 'url'
import { equal, ok } from 'uvu/assert'
import { join } from 'path'
import { test } from 'uvu'
import fse from 'fs-extra'

import { spawn, removeTmpDirs, findTmpDir } from './utils.js'

const dirname = join(fileURLToPath(import.meta.url), '..')

const cleanPackageJSONPath = join(dirname, './clean-package.json')
const cleanPublishConfigSrcPath = join(dirname, './clean-publish-config.json')

const cleanFiles = [
  'CONTRIBUTING.md',
  'LICENSE',
  'README.md',
  'TestUtils.js',
  'crowdin.yaml',
  'docs',
  'eslintImportResolver.js',
  'examples',
  'flow-typed',
  'jsconfig.json',
  'lerna.json',
  'package.json',
  'packages',
  'scripts',
  'testSetupFile.js',
  'types',
  'website'
]
const binPath = join(dirname, '..', 'clean-publish.js')
const packagePath = join(dirname, 'package')
const cleanPublishConfigPath = join(packagePath, '.clean-publish')
const tempDir = 'tmp-package'

let cleanPackageJSON
let cleanPublishConfig

test.before(async () => {
  ;[cleanPackageJSON, cleanPublishConfig] = await Promise.all([
    fse.readJSON(cleanPackageJSONPath),
    fse.readJSON(cleanPublishConfigSrcPath)
  ])
})

// Removing artifacts if tests are failed.
test.after(async () => {
  await Promise.all([
    fse.remove(cleanPublishConfigPath),
    removeTmpDirs(packagePath)
  ])
})

test('clean-publish function without "npm publish"', async () => {
  await spawn(binPath, ['--without-publish'], {
    cwd: packagePath
  })

  const tmpDirPath = await findTmpDir(packagePath)
  const packageJSONPath = join(tmpDirPath, 'package.json')
  const [tmpFiles, obj] = await Promise.all([
    fse.readdir(tmpDirPath),
    fse.readJSON(packageJSONPath)
  ])

  equal(tmpFiles, cleanFiles)
  equal(obj, cleanPackageJSON)

  await fse.remove(tmpDirPath)
})

test('clean-publish to omit exports', async () => {
  await spawn(binPath, ['--without-publish', '--exports', 'development'], {
    cwd: packagePath
  })

  const tmpDirPath = await findTmpDir(packagePath)
  const packageJSONPath = join(tmpDirPath, 'package.json')
  const obj = await fse.readJSON(packageJSONPath)
  const cleanerPackageJSON = {
    ...cleanPackageJSON,
    exports: {
      '.': {
        default: cleanPackageJSON.exports['.'].default
      }
    }
  }

  equal(obj, cleanerPackageJSON)

  await fse.remove(tmpDirPath)
})

test('clean-publish to make `temp-dir` directory', async () => {
  await spawn(binPath, ['--without-publish', '--temp-dir', tempDir], {
    cwd: packagePath
  })

  const tempDirPath = join(packagePath, tempDir)
  const packageJSONPath = join(tempDirPath, 'package.json')
  const [tmpFiles, obj] = await Promise.all([
    fse.readdir(tempDirPath),
    fse.readJSON(packageJSONPath)
  ])

  equal(tmpFiles, cleanFiles)
  equal(obj, cleanPackageJSON)

  await fse.remove(tempDirPath)
})

test('clean-publish to print message if `temp-dir` directory already exists', async () => {
  const tempDirPath = join(packagePath, tempDir)

  await fse.mkdir(tempDirPath)

  let error
  try {
    await spawn(binPath, ['--without-publish', '--temp-dir', tempDir], {
      cwd: packagePath
    })
  } catch (e) {
    error = e
  }
  ok(error.message.includes('Temporary directory "tmp-package" already exists'))

  await fse.remove(tempDirPath)
})

test('clean-publish to get config from file', async () => {
  await fse.writeFile(
    cleanPublishConfigPath,
    JSON.stringify(cleanPublishConfig),
    'utf8'
  )
  await spawn(binPath, ['--without-publish'], {
    cwd: packagePath
  })

  const tmpDirPath = await findTmpDir(packagePath)
  const packageJSONPath = join(tmpDirPath, 'package.json')
  const obj = await fse.readJSON(packageJSONPath)
  const cleanerPackageJSON = {
    ...cleanPackageJSON,
    exports: {
      '.': {
        default: cleanPackageJSON.exports['.'].default
      }
    }
  }
  delete cleanerPackageJSON.collective

  equal(obj, cleanerPackageJSON)

  await Promise.all([
    fse.remove(tmpDirPath),
    fse.remove(cleanPublishConfigPath)
  ])
})

test('clean-publish to get `temp-dir` from config file', async () => {
  await fse.writeFile(
    cleanPublishConfigPath,
    JSON.stringify({
      ...cleanPublishConfig,
      tempDir
    }),
    'utf8'
  )
  await spawn(binPath, ['--without-publish'], {
    cwd: packagePath
  })

  const tempDirPath = join(packagePath, tempDir)
  const tmpFiles = await fse.readdir(tempDirPath)

  equal(tmpFiles, cleanFiles)

  await Promise.all([
    fse.remove(tempDirPath),
    fse.remove(cleanPublishConfigPath)
  ])
})

test.run()
