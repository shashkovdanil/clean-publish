import fse from 'fs-extra'
import { join } from 'path'
import { fileURLToPath } from 'url'

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
  'e2e',
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
const tmpContentsDir = 'tmp-contents-package'

let cleanPackageJSON
let cleanPublishConfig

beforeAll(async () => {
  [cleanPackageJSON, cleanPublishConfig] = await Promise.all([
    fse.readJSON(cleanPackageJSONPath),
    fse.readJSON(cleanPublishConfigSrcPath)
  ])
})

// Removing artifacts if tests are failed.
afterAll(async () => {
  await Promise.all([
    fse.remove(cleanPublishConfigPath),
    removeTmpDirs(packagePath)
  ])
})

it('test clean-publish function without "npm publish"', async () => {
  await spawn(binPath, ['--without-publish'], {
    cwd: packagePath,
  })

  const tmpDirPath = await findTmpDir(packagePath)
  const packageJSONPath = join(tmpDirPath, 'package.json')
  const [tmpFiles, obj] = await Promise.all([
    fse.readdir(tmpDirPath),
    fse.readJSON(packageJSONPath)
  ])

  expect(tmpFiles).toEqual(cleanFiles)
  expect(obj).toEqual(cleanPackageJSON)

  await fse.remove(tmpDirPath)
})

it('test clean-publish to omit exports', async () => {
  await spawn(binPath, ['--without-publish', '--exports', 'development'], {
    cwd: packagePath,
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

  expect(obj).toEqual(cleanerPackageJSON)

  await fse.remove(tmpDirPath)
})

it('test clean-publish to make `contents` directory', async () => {
  await spawn(binPath, ['--without-publish', '--contents', tmpContentsDir], {
    cwd: packagePath,
  })

  const contentsDirPath = join(packagePath, tmpContentsDir)
  const packageJSONPath = join(contentsDirPath, 'package.json')
  const [tmpFiles, obj] = await Promise.all([
    fse.readdir(contentsDirPath),
    fse.readJSON(packageJSONPath)
  ])

  expect(tmpFiles).toEqual(cleanFiles)
  expect(obj).toEqual(cleanPackageJSON)

  await fse.remove(contentsDirPath)
})

it('test clean-publish to get config from file', async () => {
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

  expect(obj).toEqual(cleanerPackageJSON)

  await Promise.all([
    fse.remove(tmpDirPath),
    fse.remove(cleanPublishConfigPath)
  ])
})

it('test clean-publish to get `contents` from config file', async () => {
  await fse.writeFile(
    cleanPublishConfigPath,
    JSON.stringify({
      ...cleanPublishConfig,
      contents: tmpContentsDir
    }),
    'utf8'
  )
  await spawn(binPath, ['--without-publish'], {
    cwd: packagePath
  })

  const contentsDirPath = join(packagePath, tmpContentsDir)
  const tmpFiles = await fse.readdir(contentsDirPath)

  expect(tmpFiles).toEqual(cleanFiles)

  await Promise.all([
    fse.remove(contentsDirPath),
    fse.remove(cleanPublishConfigPath)
  ])
})
