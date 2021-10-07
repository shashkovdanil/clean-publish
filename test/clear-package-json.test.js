import fse from 'fs-extra'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { spawn } from './utils.js'

const dirname = join(fileURLToPath(import.meta.url), '..')

const cleanPackageJSONPath = join(dirname, './clean-package.json')
const cleanPublishConfigSrcPath = join(dirname, './clean-publish-config.json')

const binPath = join(dirname, '..', 'clear-package-json.js')
const packagePath = join(dirname, 'package')
const packageJSONPath = join(packagePath, 'package.json')
const minPackageJSONPath = join(packagePath, 'package.min.json')
const cleanPublishConfigPath = join(packagePath, '.clean-publish')

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
    fse.remove(minPackageJSONPath),
    fse.remove(cleanPublishConfigPath)
  ])
})

it('test clear-package-json function', async () => {
  await spawn(binPath, [packageJSONPath, '-o', minPackageJSONPath], {
    cwd: packagePath
  })

  const obj = await fse.readJSON(minPackageJSONPath)

  expect(obj).toEqual(cleanPackageJSON)

  await fse.remove(minPackageJSONPath)
})

it('test clear-package-json to omit exports', async () => {
  await spawn(binPath, [packageJSONPath, '-o', minPackageJSONPath, '--exports', 'development'], {
    cwd: packagePath
  })

  const obj = await fse.readJSON(minPackageJSONPath)
  const cleanerPackageJSON = Object.assign({}, cleanPackageJSON)
  delete cleanerPackageJSON.exports['.'].development

  expect(obj).toEqual(cleanerPackageJSON)

  await fse.remove(minPackageJSONPath)
})

it('test clear-package-json to get fields from config file', async () => {
  await fse.writeFile(
    cleanPublishConfigPath,
    JSON.stringify(cleanPublishConfig),
    'utf8'
  )
  await spawn(binPath, [packageJSONPath, '-o', minPackageJSONPath], {
    cwd: packagePath,
  })

  const obj = await fse.readJSON(minPackageJSONPath)
  const cleanerPackageJSON = Object.assign({}, cleanPackageJSON)
  delete cleanerPackageJSON.collective
  delete cleanerPackageJSON.exports['.'].development

  expect(obj).toEqual(cleanerPackageJSON)

  await Promise.all([
    fse.remove(minPackageJSONPath),
    fse.remove(cleanPublishConfigPath)
  ])
})
