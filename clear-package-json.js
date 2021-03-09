#!/usr/bin/env node

const { clearPackageJSON } = require('./core')
const { readJson, readJsonFromStdin, writeJson } = require('./utils')
const getConfig = require('./get-config')

const { isTTY } = process.stdin

const HELP =
  'npx clear-package-json <input> [options]\n' +
  '\n' +
  'Options:\n' +
  '  --help        Show help\n' +
  '  --version     Show version number\n' +
  '  --fields      One or more exclude package.json fields\n' +
  '  --output, -o  Output file name'

const options = {}
let input, output

function handleOptions () {
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--help') {
      process.stdout.write(HELP + '\n')
      process.exit(0)
    } else if (process.argv[i] === '--version') {
      process.stdout.write(require('./package.json').version + '\n')
      process.exit(0)
    } else if (process.argv[i] === '-o' || process.argv[i] === '--output') {
      output = process.argv[i + 1]
      i += 1
    } else if (process.argv[i] === '--fields') {
      options.fields = process.argv[i + 1].split(/,\s*/)
      i += 1
    } else {
      input = process.argv[i]
    }
  }
  if (!input) {
    process.stderr.write(
      HELP + '\n\nNot enough non-option arguments: got 0, need at least 1'
    )
    process.exit(1)
  }
  if (!options.fields) {
    return getConfig().then(config => {
      options.fields = config.fields
    })
  }
  return Promise.resolve()
}

handleOptions()
  .then(() => (isTTY && input ? readJson(input) : readJsonFromStdin()))
  .then(packageJson => {
    const cleanPackageJSON = clearPackageJSON(packageJson, options.fields)
    if (output) {
      return writeJson(output, cleanPackageJSON, { spaces: 2 })
    }
    process.stdout.write(`${JSON.stringify(cleanPackageJSON, null, '  ')}\n`)
  })
  .catch(error => {
    process.stderr.write(error.stack + '\n')
    process.exit()
  })
