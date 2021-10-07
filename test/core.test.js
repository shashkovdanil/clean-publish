import fse from 'fs-extra'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { clearPackageJSON } from '../core.js'

const dirname = join(fileURLToPath(import.meta.url), '..')
const srcPackageJSONPath = join(dirname, 'package', 'package.json')
const cleanPackageJSONPath = join(dirname, 'clean-package.json')

describe('clearPackageJSON', () => {
  let srcPackageJson
  let cleanPackageJson

  beforeAll(async () => {
    [srcPackageJson, cleanPackageJson] = await Promise.all([
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
          'development': './src/index.js',
          'default': './dest/index.js'
        }
      }
    }
    const expected = {
      ...cleanPackageJson,
      exports: {
        '.': {
          'default': './dest/index.js'
        }
      }
    }

    expect(clearPackageJSON(packageJson, [], ['development'])).toEqual(expected)
  })
})
