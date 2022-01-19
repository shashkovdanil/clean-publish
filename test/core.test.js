import { fileURLToPath } from 'url'
import { equal, is } from 'uvu/assert'
import { test } from 'uvu'
import { join } from 'path'
import fse from 'fs-extra'

import { clearPackageJSON, getReadmeUrlFromRepository } from '../core.js'

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

const git = 'https://github.com/org/repo.git'
const shortcut = 'org/repo'
const bitbucketShirtcut = 'bitbucket:org/repo'
const readme = 'https://github.com/org/repo#readme'
const bitbucketReadme = 'https://bitbucket.org/org/repo#readme'

test('getReadmeUrlFromRepository returns docs url', () => {
  is(getReadmeUrlFromRepository(git), readme)
  is(getReadmeUrlFromRepository(shortcut), readme)
  is(getReadmeUrlFromRepository(bitbucketShirtcut), bitbucketReadme)
})

test('getReadmeUrlFromRepository handles repo object', () => {
  is(
    getReadmeUrlFromRepository({
      url: git
    }),
    readme
  )
})

test.run()
