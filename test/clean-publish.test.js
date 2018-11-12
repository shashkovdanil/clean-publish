const spawn = require('cross-spawn')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const cleanPackageJSON = require('./clean-package.json')

const cleanFiles = [
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'README.md',
  'TestUtils.js',
  'crowdin.yaml',
  'docs',
  'e2e',
  'eslintImportResolver.js',
  'examples',
  'flow-typed',
  'jsconfig.json',
  'lerna.json',
  'package.json',
  'packages',
  'scripts',
  'testSetupFile.js',
  'types',
  'website'
]

it('Test clean-publish function without "npm publish"', done => {
  spawn('npm', ['run', 'test-clean-publish'], {
    stdio: 'inherit'
  }).on('close', () => {
    fs.readdir(path.join(__dirname, 'package'), (err, files) => {
      if (err) return console.error(err)
      const tmpDir = files.filter(file => file.search('tmp') === 0)[0]
      const tmpDirPath = path.join(__dirname, 'package', tmpDir)
      const packageJSON = path.join(tmpDirPath, 'package.json')
      fs.readdir(tmpDirPath, (tmpErr, tmpFiles) => {
        if (tmpErr) return console.error(tmpErr)
        expect(tmpFiles).toEqual(cleanFiles)
        fse.readJson(packageJSON, (readJSONErr, obj) => {
          if (readJSONErr) return console.error(readJSONErr)
          expect(obj).toEqual(cleanPackageJSON)
          fse.removeSync(tmpDirPath)
          done()
        })
      })
    })
  })
})
