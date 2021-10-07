#!/usr/bin/env node

import { readJson, readJsonFromStdin, writeJson, parseListArg } from './utils.js'
import { clearPackageJSON } from './core.js'
import { getConfig } from './get-config.js'

const HELP =
  'npx clear-package-json <input> [options]\n' +
  '\n' +
  'Options:\n' +
  '  --help        Show help\n' +
  '  --version     Show version number\n' +
  '  --fields      One or more exclude package.json fields\n' +
  '  --exports     One or more exclude exports conditions\n' +
  '  --output, -o  Output file name'

async function handleOptions () {
  const options = {}
  let input, output

  for (let i = 2; i < process.argv.length; i++) {
    switch (process.argv[i]) {
      case '--help':
        process.stdout.write(HELP + '\n')
        process.exit(0)
      case '--version':
        process.stdout.write(require('./package.json').version + '\n')
        process.exit(0)
      case '-o':
      case '--output':
        output = process.argv[i + 1]
        i += 1
        break
      case '--fields':
        options.fields = parseListArg(process.argv[i + 1])
        i += 1
        break
      case '--exports':
        options.exports = parseListArg(process.argv[i + 1])
        i += 1
        break
      default:
        input = process.argv[i]
    }
  }

  if (!input) {
    process.stderr.write(
      HELP + '\n\nNot enough non-option arguments: got 0, need at least 1'
    )
    process.exit(1)
  }

  if (!options.fields && !options.exports) {
    let config = await getConfig()
    options.fields = config.fields
    options.exports = config.exports
  }
  return [input, output, options]
}

async function run () {
  const [input, output, options] = await handleOptions()
  const packageJson = await (input ? readJson(input) : readJsonFromStdin())
  const cleanPackageJSON = clearPackageJSON(packageJson, options.fields, options.exports)
  if (output) {
    await writeJson(output, cleanPackageJSON, { spaces: 2 })
  } else {
    process.stdout.write(`${JSON.stringify(cleanPackageJSON, null, '  ')}\n`)
  }
}

run().catch(error => {
  process.stderr.write(error.stack + '\n')
  process.exit(1)
})
