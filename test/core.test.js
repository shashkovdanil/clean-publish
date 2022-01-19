import { fileURLToPath } from 'url'
import { equal, is } from 'uvu/assert'
import { test } from 'uvu'
import { join } from 'path'
import fse from 'fs-extra'

import { clearPackageJSON, getReadmeUrlFromRepository, createFilesFilter } from '../core.js'

const dirname = join(fileURLToPath(import.meta.url), '..')
const srcPackageJSONPath = join(dirname, 'package', 'package.json')
const cleanPackageJSONPath = join(dirname, 'clean-package.json')

let srcPackageJson
let cleanPackageJson

test.before(async () => {
  ;[srcPackageJson, cleanPackageJson] = await Promise.all([
    fse.readJSON(srcPackageJSONPath),
    fse.readJSON(cleanPackageJSONPath)
  ])
})

test('clearPackageJSON cleans default fields', () => {
  equal(clearPackageJSON(srcPackageJson), cleanPackageJson)
})

test('clearPackageJSON cleans additional fields', () => {
  const expected = {
    ...cleanPackageJson
  }

  delete expected.collective

  equal(clearPackageJSON(srcPackageJson, ['collective']), expected)
})

test('getReadmeUrlFromRepository handles repo object', () => {
  is(
    getReadmeUrlFromRepository({
      url: 'git+https://github.com/org/repo.git'
    }),
    'https://github.com/org/repo#readme'
  )
})

test('createFilesFilter creates correct filter', () => {
  const filter = createFilesFilter([
    /^\.config.js(on)?/,
    '.DS_Store',
    '**/*.spec.js'
  ])

  is(filter('.config.json'), false)
  is(filter('test/.config.json'), false)
  is(filter('.DS_Store'), false)
  is(filter('dist/.DS_Store'), false)
  is(filter('src/core.spec.js'), false)
  is(filter('src/cli/options.spec.js'), false)
  is(filter('src/cli/options.js'), true)
  is(filter('dist/index.js'), true)
})

test.run()
