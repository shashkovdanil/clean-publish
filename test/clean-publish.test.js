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

const cleanFiles = [
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
const binPath = join(dirname, '..', 'clean-publish.js')
const packagePath = join(dirname, 'package')
const cleanPublishConfigPath = join(packagePath, '.clean-publish')

// Removing artifacts if tests are failed.
afterAll(() => {
  fse.remove(cleanPublishConfigPath)
  fs.readdir(packagePath, (err, files) => {
    if (err) return
    const tmpDir = files.filter(file => file.search('tmp') === 0)[0]
    if (!tmpDir) return
    const tmpDirPath = join(packagePath, tmpDir)
    fse.remove(tmpDirPath)
  })
})

it('test clean-publish function without "npm publish"', done => {
  spawn(binPath, ['--without-publish'], {
    cwd: packagePath,
    stdio: 'inherit'
  }).on('close', () => {
    fs.readdir(packagePath, (err, files) => {
      if (err) return done(err)
      const tmpDir = files.filter(file => file.search('tmp') === 0)[0]
      const tmpDirPath = join(packagePath, tmpDir)
      const packageJSONPath = join(tmpDirPath, 'package.json')
      fs.readdir(tmpDirPath, (tmpErr, tmpFiles) => {
        if (tmpErr) return done(tmpErr)
        expect(tmpFiles).toEqual(cleanFiles)
        fse.readJson(packageJSONPath, (readJSONErr, obj) => {
          if (readJSONErr) return done(readJSONErr)
          expect(obj).toEqual(cleanPackageJSON)
          fse.removeSync(tmpDirPath)
          done()
        })
      })
    })
  })
})

it('test clean-publish to get config from file', done => {
  fs.writeFileSync(
    cleanPublishConfigPath,
    JSON.stringify(cleanPublishConfig),
    'utf8'
  )
  spawn(binPath, ['--without-publish'], {
    cwd: packagePath,
    stdio: 'inherit'
  }).on('close', () => {
    fs.readdir(packagePath, (err, files) => {
      if (err) return done(err)
      const tmpDir = files.filter(file => file.search('tmp') === 0)[0]
      const tmpDirPath = join(packagePath, tmpDir)
      const packageJSONPath = join(tmpDirPath, 'package.json')
      fse.readJson(packageJSONPath, (readJSONErr, obj) => {
        if (readJSONErr) return done(readJSONErr)
        const cleanerPackageJSON = Object.assign({}, cleanPackageJSON)
        delete cleanerPackageJSON.collective
        expect(obj).toEqual(cleanerPackageJSON)
        fse.removeSync(tmpDirPath)
        fse.removeSync(cleanPublishConfigPath)
        done()
      })
    })
  })
})
