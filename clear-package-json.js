#!/usr/bin/env node

const chalk = require('chalk')
const yargs = require('yargs')
const {
  clearPackageJSON
} = require('./core')
const {
  readJson,
  writeJson
} = require('./utils')
const getConfig = require('./get-config')

const { argv } = yargs
  .usage('$0')
  .command(
    '$0 <input> [options]',
    'Clear package.json file',
    yargsCommand => {
      yargsCommand
        .positional('input', {
          type: 'string',
          desc: 'Input package.json file'
        })
        .require('input')
    }
  )
  .option('fields', {
    type: 'array',
    desc: 'One or more exclude package.json fields'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    desc: 'Output file name'
  })

const options = {}

function handleOptions () {
  Object.assign(options, argv)
  if (options['_'].length === 0) {
    return getConfig().then(config => {
      Object.assign(options, config)
    })
  }
  return Promise.resolve()
}

handleOptions()
  .then(() => (
    readJson(argv.input)
  ))
  .then(packageJson => {
    const cleanPackageJSON = clearPackageJSON(packageJson, options.fields)
    if (argv.output) {
      return writeJson(
        argv.output,
        cleanPackageJSON,
        { spaces: 2 }
      )
    }
    process.stdout.write(`${ JSON.stringify(cleanPackageJSON, null, '  ') }\n`)
  })
  .catch(error => {
    console.error(chalk.red(error))
    process.exit()
  })
