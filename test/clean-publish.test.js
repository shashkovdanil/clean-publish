const spawn = require('cross-spawn')
const fs = require('fs')
const fse = require('fs-extra')

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

const cleanPackageJSON = {
  private: true,
  scripts: {
    publish: 'yarn build-clean && yarn build && lerna publish --silent',
    postinstall: 'opencollective postinstall && yarn build'
  },
  workspaces: [
    'packages/*',
    'website',
    'examples/*'
  ],
  dependencies: {
    opencollective: '^1.0.3'
  },
  collective: {
    type: 'opencollective',
    url: 'https://opencollective.com/jest',
    logo: 'https://opencollective.com/jest/logo.txt'
  }
}

it('Test clean-publish function without "npm publish"', () => {
  spawn('npm', ['run', 'test-clean'], {
    stdio: 'inherit'
  }).on('close', () => {
    fs.readdir('./test/package', (err, files) => {
      if (err) console.error(err)
      const tmpDir = files.filter(file => file.search('tmp') === 0)[0]
      const tmpDirPath = `./test/package/${ tmpDir }`
      fs.readdir(tmpDirPath, (tmpErr, tmpFiles) => {
        if (tmpErr) console.error(tmpErr)
        expect(tmpFiles).toEqual(cleanFiles)
        fse.readJson(`${ tmpDirPath }/package.json`, (readJSONErr, obj) => {
          if (readJSONErr) console.error(readJSONErr)
          expect(obj).toEqual(cleanPackageJSON)
          fse.removeSync(tmpDirPath)
        })
      })
    })
  })
})
