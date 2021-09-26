#!/usr/bin/env node

import {
  createTempDirectory,
  readSrcDirectory,
  clearFilesList,
  copyFiles,
  readPackageJSON,
  clearPackageJSON,
  writePackageJSON,
  publish,
  removeTempDirectory,
  runScript,
  cleanDocs
} from './core.js'
import { getConfig } from './get-config.js'

const HELP =
  'npx clean-publish\n' +
  '\n' +
  'Options:\n' +
  '  --help             Show help\n' +
  '  --version          Show version number\n' +
  '  --cleanDocs        keep only main section of README.md' +
  '  --files            One or more exclude files\n' +
  '  --fields           One or more exclude package.json fields\n' +
  '  --without-publish  Clean package without npm publish\n' +
  '  --package-manager  Package manager to use\n' +
  '  --access           Whether the npm registry publishes this package\n' +
  '                     as a public package, or restricted\n' +
  '  --tag              Registers the package with the given tag\n' +
  '  --before-script    Run script on the to-release dir before npm\n' +
  '                     publish'

async function handleOptions () {
  let options = {}
  options.packageManager = 'npm'
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--help') {
      process.stdout.write(HELP + '\n')
      process.exit(0)
    } else if (process.argv[i] === '--version') {
      process.stdout.write(require('./package.json').version + '\n')
      process.exit(0)
    } else if (process.argv[i] === '--without-publish') {
      options.withoutPublish = true
    } else if (process.argv[i] === '--package-manager') {
      options.packageManager = process.argv[i + 1]
      i += 1
    } else if (process.argv[i] === '--before-script') {
      options.beforeScript = process.argv[i + 1]
      i += 1
    } else if (process.argv[i] === '--access') {
      options.access = process.argv[i + 1]
      i += 1
    } else if (process.argv[i] === '--files') {
      options.files = process.argv[i + 1].split(/,\s*/)
      i += 1
    } else if (process.argv[i] === '--clean-docs') {
      options.cleanDocs = true
      i += 1
    } else if (process.argv[i] === '--tag') {
      options.tag = process.argv[i + 1].split(/,\s*/)
      i += 1
    } else if (process.argv[i] === '--fields') {
      options.fields = process.argv[i + 1].split(/,\s*/)
      i += 1
    } else {
      options._ = process.argv[i]
    }
  }
  if (!options._) {
    let config = await getConfig()
    return { ...config, ...options }
  } else {
    return options
  }
}

async function run () {
  const options = await handleOptions()

  const tempDirectoryName = await createTempDirectory()

  const files = await readSrcDirectory()

  const filteredFiles = clearFilesList(
    files,
    [tempDirectoryName].concat(options.files)
  )
  await copyFiles(filteredFiles, tempDirectoryName)

  const packageJson = await readPackageJSON()


  if (options.cleanDocs) {
    await cleanDocs(tempDirectoryName, packageJson.repository)
  }

  const cleanPackageJSON = clearPackageJSON(packageJson, options.fields)
  await writePackageJSON(tempDirectoryName, cleanPackageJSON)

  let prepublishSuccess = true
  if (options.beforeScript) {
    prepublishSuccess = await runScript(options.beforeScript, tempDirectoryName)
  }

  if (!options.withoutPublish && prepublishSuccess) {
    await publish(
      tempDirectoryName,
      options.packageManager,
      options.access,
      options.tag
    )
  }

  if (!options.withoutPublish) {
    await removeTempDirectory(tempDirectoryName)
  }
}

run().catch(error => {
  process.stderr.write(error.stack + '\n')
  process.exit(1)
})
