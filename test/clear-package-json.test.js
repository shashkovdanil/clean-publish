const spawn = require('cross-spawn')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const cleanPackageJSON = require('./clean-package.json')
const cleanPublishConfig = require('./clean-publish-config.json')

const packageJSONPath = path.join(__dirname, 'package', 'package.min.json')
const cleanPublishConfigPath = path.join(__dirname, 'package', '.clean-publish')

// Removing artifacts if tests are failed.
afterAll(() => {
  fse.remove(packageJSONPath)
  fse.remove(cleanPublishConfigPath)
})

it('Test clear-package-json function', done => {
  spawn('npm', ['run', 'test-clear-package-json'], {
    stdio: 'inherit'
  }).on('close', () => {
    fse.readJson(packageJSONPath, (readJSONErr, obj) => {
      if (readJSONErr) return done(readJSONErr)
      expect(obj).toEqual(cleanPackageJSON)
      fse.removeSync(packageJSONPath)
      done()
    })
  })
})

it('Test clear-package-json to get fields from config file', done => {
  fs.writeFileSync(
    cleanPublishConfigPath,
    JSON.stringify(cleanPublishConfig),
    'utf8'
  )
  spawn('npm', ['run', 'test-clear-package-json'], {
    stdio: 'inherit'
  }).on('close', () => {
    fse.readJson(packageJSONPath, (readJSONErr, obj) => {
      if (readJSONErr) return done(readJSONErr)
      const cleanerPackageJSON = Object.assign({}, cleanPackageJSON)
      delete cleanerPackageJSON.collective
      expect(obj).toEqual(cleanerPackageJSON)
      fse.removeSync(packageJSONPath)
      fse.removeSync(cleanPublishConfigPath)
      done()
    })
  })
})
