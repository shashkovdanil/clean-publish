import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { equal, ok } from 'uvu/assert'
import { join } from 'path'
import { test } from 'uvu'

import { remove, readJSON } from '../utils.js'
import { spawn, removeTmpDirs, findTmpDir } from './utils.js'

const dirname = join(fileURLToPath(import.meta.url), '..')

const cleanPackageJSONPath = join(dirname, './clean-package.json')
const cleanPublishConfigSrcPath = join(dirname, './clean-publish-config.json')

const cleanFiles = [
  'LICENSE',
  'README.md',
  'TestUtils.js',
  'crowdin.yaml',
  'eslintImportResolver.js',
  'flow-typed',
  'jsconfig.json',
  'lerna.json',
  'package.json',
  'scripts',
  'testSetupFile.js',
  'types'
]
const binPath = join(dirname, '..', 'clean-publish.js')
const packagePath = join(dirname, 'package')
const cleanPublishConfigPath = join(packagePath, '.clean-publish')
const tempDir = 'tmp-package'

let cleanPackageJSON
let cleanPublishConfig

test.before(async () => {
  ;[cleanPackageJSON, cleanPublishConfig] = await Promise.all([
    readJSON(cleanPackageJSONPath),
    readJSON(cleanPublishConfigSrcPath)
  ])
})

// Removing artifacts if tests are failed.
test.after(async () => {
  await Promise.all([
    remove(cleanPublishConfigPath),
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
    fs.readdir(tmpDirPath),
    readJSON(packageJSONPath)
  ])

  equal(tmpFiles, cleanFiles)
  equal(obj, cleanPackageJSON)

  await remove(tmpDirPath)
})

test('clean-publish to make `temp-dir` directory', async () => {
  await spawn(binPath, ['--without-publish', '--temp-dir', tempDir], {
    cwd: packagePath
  })

  const tempDirPath = join(packagePath, tempDir)
  const packageJSONPath = join(tempDirPath, 'package.json')
  const [tmpFiles, obj] = await Promise.all([
    fs.readdir(tempDirPath),
    readJSON(packageJSONPath)
  ])

  equal(tmpFiles, cleanFiles)
  equal(obj, cleanPackageJSON)

  await remove(tempDirPath)
})

test('clean-publish to print message if `temp-dir` directory already exists', async () => {
  const tempDirPath = join(packagePath, tempDir)

  await fs.mkdir(tempDirPath)

  let error
  try {
    await spawn(binPath, ['--without-publish', '--temp-dir', tempDir], {
      cwd: packagePath
    })
  } catch (e) {
    error = e
  }
  ok(error.message.includes('Temporary directory "tmp-package" already exists'))

  await remove(tempDirPath)
})

test('clean-publish to get config from file', async () => {
  await fs.writeFile(
    cleanPublishConfigPath,
    JSON.stringify(cleanPublishConfig),
    'utf8'
  )
  await spawn(binPath, ['--without-publish'], {
    cwd: packagePath
  })

  const tmpDirPath = await findTmpDir(packagePath)
  const packageJSONPath = join(tmpDirPath, 'package.json')
  const obj = await readJSON(packageJSONPath)
  const cleanerPackageJSON = { ...cleanPackageJSON }
  delete cleanerPackageJSON.collective

  equal(obj, cleanerPackageJSON)

  await Promise.all([remove(tmpDirPath), remove(cleanPublishConfigPath)])
})

test('clean-publish to get `temp-dir` from config file', async () => {
  await fs.writeFile(
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
  const tmpFiles = await fs.readdir(tempDirPath)

  equal(tmpFiles, cleanFiles)

  await Promise.all([remove(tempDirPath), remove(cleanPublishConfigPath)])
})

test.run()
