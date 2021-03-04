const spawn = require('cross-spawn')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')

const cleanPackageJSON = require('./clean-package.json')
const cleanPublishConfig = require('./clean-publish-config.json')

const binPath = path.join(__dirname, '..', 'clear-package-json.js')
const packagePath = path.join(__dirname, 'package')
const packageJSONPath = path.join(packagePath, 'package.json')
const minPackageJSONPath = path.join(packagePath, 'package.min.json')
const cleanPublishConfigPath = path.join(packagePath, '.clean-publish')

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
