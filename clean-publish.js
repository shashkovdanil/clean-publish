#!/usr/bin/env node

import { parseListArg } from './utils.js'
import {
  createTempDirectory,
  readSrcDirectory,
  clearFilesList,
  copyFiles,
  readPackageJSON,
  clearPackageJSON,
  writePackageJSON,
  publish,
  cleanComments,
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
  '  --clean-docs       Keep only main section of README.md' +
  '  --clean-comments   Clean inline comments from JS files' +
  '  --files            One or more exclude files\n' +
  '  --fields           One or more exclude package.json fields\n' +
  '  --exports          One or more exclude exports conditions\n' +
  '  --without-publish  Clean package without npm publish\n' +
  '  --dry-run          Reports the details of what would have been published\n' +
  '  --package-manager  Package manager to use\n' +
  '  --access           Whether the npm registry publishes this package\n' +
  '                     as a public package, or restricted\n' +
  '  --tag              Registers the package with the given tag\n' +
  '  --before-script    Run script on the to-release dir before npm\n' +
  '                     publish\n' +
  '  --temp-dir         Create temporary directory with given name'

const DEFAULT_OPTIONS = {
  packageManager: 'npm'
}

async function handleOptions () {
  let options = {}
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--help') {
      process.stdout.write(HELP + '\n')
      process.exit(0)
    } else if (process.argv[i] === '--version') {
      process.stdout.write(require('./package.json').version + '\n')
      process.exit(0)
    } else if (process.argv[i] === '--without-publish') {
      options.withoutPublish = true
    } else if (process.argv[i] === '--dry-run') {
      options.dryRun = true
      i += 1
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
      options.files = parseListArg(process.argv[i + 1])
      i += 1
    } else if (process.argv[i] === '--clean-docs') {
      options.cleanDocs = true
      i += 1
    } else if (process.argv[i] === '--clean-commentd') {
      options.cleanComments = true
      i += 1
    } else if (process.argv[i] === '--tag') {
      options.tag = parseListArg(process.argv[i + 1])
      i += 1
    } else if (process.argv[i] === '--fields') {
      options.fields = parseListArg(process.argv[i + 1])
      i += 1
    } else if (process.argv[i] === '--exports') {
      options.exports = parseListArg(process.argv[i + 1])
      i += 1
    }  else if (process.argv[i] === '--temp-dir') {
      options.tempDir = process.argv[i + 1]
      i += 1
    } else {
      options._ = process.argv[i]
    }
  }
  if (!options._) {
    let config = await getConfig()
    return { ...DEFAULT_OPTIONS, ...config, ...options }
  } else {
    return options
  }
}

async function run () {
  const options = await handleOptions()

  const tempDirectoryName = await createTempDirectory(options.tempDir)

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

  if (options.cleanComments) {
    await cleanComments(tempDirectoryName)
  }

  const cleanPackageJSON = clearPackageJSON(packageJson, options.fields, options.exports)
  await writePackageJSON(tempDirectoryName, cleanPackageJSON)

  let prepublishSuccess = true
  if (options.beforeScript) {
    prepublishSuccess = await runScript(options.beforeScript, tempDirectoryName)
  }

  if (!options.withoutPublish && prepublishSuccess) {
    await publish(tempDirectoryName, options)
  }

  if (!options.withoutPublish) {
    await removeTempDirectory(tempDirectoryName)
  }
}

run().catch(error => {
  process.stderr.write(error.stack + '\n')
  process.exit(1)
})
