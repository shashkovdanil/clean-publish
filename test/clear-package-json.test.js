import spawn from 'cross-spawn'
import fs from 'fs'
import fse from 'fs-extra'
import { join } from 'path'
import { fileURLToPath } from 'url'

const dirname = join(fileURLToPath(import.meta.url), '..')

const cleanPackageJSON = fse.readJSONSync(join(dirname, './clean-package.json'))
const cleanPublishConfig = fse.readJSONSync(
  join(dirname, './clean-publish-config.json')
)

const binPath = join(dirname, '..', 'clear-package-json.js')
const packagePath = join(dirname, 'package')
const packageJSONPath = join(packagePath, 'package.json')
const minPackageJSONPath = join(packagePath, 'package.min.json')
const cleanPublishConfigPath = join(packagePath, '.clean-publish')

// Removing artifacts if tests are failed.
afterAll(() => {
  fse.remove(minPackageJSONPath)
  fse.remove(cleanPublishConfigPath)
})

it('test clear-package-json function', done => {
  spawn(binPath, [packageJSONPath, '-o', minPackageJSONPath], {
    cwd: packagePath,
    stdio: 'inherit'
  }).on('close', () => {
    fse.readJson(minPackageJSONPath, (readJSONErr, obj) => {
      if (readJSONErr) return done(readJSONErr)
      expect(obj).toEqual(cleanPackageJSON)
      fse.removeSync(minPackageJSONPath)
      done()
    })
  })
})

it('test clear-package-json to get fields from config file', done => {
  fs.writeFileSync(
    cleanPublishConfigPath,
    JSON.stringify(cleanPublishConfig),
    'utf8'
  )
  spawn(binPath, [packageJSONPath, '-o', minPackageJSONPath], {
    cwd: packagePath,
    stdio: 'inherit'
  }).on('close', () => {
    fse.readJson(minPackageJSONPath, (readJSONErr, obj) => {
      if (readJSONErr) return done(readJSONErr)
      const cleanerPackageJSON = Object.assign({}, cleanPackageJSON)
      delete cleanerPackageJSON.collective
      expect(obj).toEqual(cleanerPackageJSON)
      fse.removeSync(minPackageJSONPath)
      fse.removeSync(cleanPublishConfigPath)
      done()
    })
  })
})
