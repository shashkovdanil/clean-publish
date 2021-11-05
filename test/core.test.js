import fse from 'fs-extra'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { clearPackageJSON, getReadmeUrlFromRepository } from '../core.js'

const dirname = join(fileURLToPath(import.meta.url), '..')
const srcPackageJSONPath = join(dirname, 'package', 'package.json')
const cleanPackageJSONPath = join(dirname, 'clean-package.json')

describe('clearPackageJSON', () => {
  let srcPackageJson
  let cleanPackageJson

  beforeAll(async () => {
    ;[srcPackageJson, cleanPackageJson] = await Promise.all([
      fse.readJSON(srcPackageJSONPath),
      fse.readJSON(cleanPackageJSONPath)
    ])
  })

  it('should clean default fields', () => {
    expect(clearPackageJSON(srcPackageJson)).toEqual(cleanPackageJson)
  })

  it('should clean additional fields', () => {
    const expected = {
      ...cleanPackageJson
    }

    delete expected.collective

    expect(clearPackageJSON(srcPackageJson, ['collective'])).toEqual(expected)
  })

  it('should clean exports', () => {
    const packageJson = {
      ...srcPackageJson,
      exports: {
        '.': {
          development: './src/index.js',
          default: './dest/index.js'
        }
      }
    }
    const expected = {
      ...cleanPackageJson,
      exports: {
        '.': {
          default: './dest/index.js'
        }
      }
    }

    expect(clearPackageJSON(packageJson, [], ['development'])).toEqual(expected)
  })
})

describe('getReadmeUrlFromRepository', () => {
  const git = 'https://github.com/org/repo.git'
  const shirtcut = 'org/repo'
  const bitbucketShirtcut = 'bitbucket:org/repo'
  const readme = 'https://github.com/org/repo#readme'
  const bitbucketReadme = 'https://bitbucket.org/org/repo#readme'

  it('should return docs url', () => {
    expect(getReadmeUrlFromRepository(git)).toBe(readme)
    expect(getReadmeUrlFromRepository(shirtcut)).toBe(readme)
    expect(getReadmeUrlFromRepository(bitbucketShirtcut)).toBe(bitbucketReadme)
  })

  it('should handle repo object', () => {
    expect(
      getReadmeUrlFromRepository({
        url: git
      })
    ).toBe(readme)
  })
})
