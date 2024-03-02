import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'uvu'
import { equal } from 'uvu/assert'

import { readJSON, remove } from '../utils.js'
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

test.before(async () => {
  ;[cleanPackageJSON, cleanPublishConfig] = await Promise.all([
    readJSON(cleanPackageJSONPath),
    readJSON(cleanPublishConfigSrcPath)
  ])
})

// Removing artifacts if tests are failed.
test.after(async () => {
  await Promise.all([
    remove(minPackageJSONPath),
    remove(cleanPublishConfigPath)
  ])
})

test('clear-package-json function', async () => {
  await spawn(binPath, [packageJSONPath, '-o', minPackageJSONPath], {
    cwd: packagePath
  })

  const obj = await readJSON(minPackageJSONPath)

  equal(obj, cleanPackageJSON)

  await remove(minPackageJSONPath)
})

test('clear-package-json to get fields from config file', async () => {
  await fs.writeFile(
    cleanPublishConfigPath,
    JSON.stringify(cleanPublishConfig),
    'utf8'
  )
  await spawn(binPath, [packageJSONPath, '-o', minPackageJSONPath], {
    cwd: packagePath
  })

  const obj = await readJSON(minPackageJSONPath)
  const cleanerPackageJSON = { ...cleanPackageJSON }
  delete cleanerPackageJSON.collective

  equal(obj, cleanerPackageJSON)

  await Promise.all([
    remove(minPackageJSONPath),
    remove(cleanPublishConfigPath)
  ])
})

test.run()
