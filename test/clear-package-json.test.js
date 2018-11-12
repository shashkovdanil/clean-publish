const spawn = require('cross-spawn')
const fse = require('fs-extra')
const path = require('path')
const cleanPackageJSON = require('./clean-package.json')

it('Test clear-package-json function', done => {
  spawn('npm', ['run', 'test-clear-package-json'], {
    stdio: 'inherit'
  }).on('close', () => {
    const packageJSON = path.join(__dirname, 'package', 'package.min.json')
    fse.readJson(packageJSON, (readJSONErr, obj) => {
      if (readJSONErr) return console.error(readJSONErr)
      expect(obj).toEqual(cleanPackageJSON)
      fse.removeSync(packageJSON)
      done()
    })
  })
})
