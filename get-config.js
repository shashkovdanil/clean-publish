/**
 * Spaghetti were carefully borrowed from:
 * https://github.com/ai/size-limit/blob/master/cli.js
 */

import { lilconfig } from 'lilconfig'
import { relative } from 'path'

import { isObject } from './utils.js'

const PACKAGE_ERRORS = {
  notObject:
    'The `"clean-publish"` section of package.json ' + 'must be `an object`',
  empty: 'The `"clean-publish"` section of package.json must `not be empty`',
  filesNotStringsOrRegExps:
    'The `files` in the `"clean-publish"` section ' +
    'of package.json must be ' +
    '`an array of strings or RegExps`',
  fieldsNotStrings:
    'The `fields` in the `"clean-publish"` section ' +
    'of package.json must be `an array of strings`'
}
const FILE_ERRORS = {
  notObject: 'Clean Publish config must contain `an object`',
  empty: 'Clean Publish config must `not be empty`',
  filesNotStringsOrRegExps:
    'The `files` in the Clean Publish config ' +
    'must be `an array of strings or RegExps`',
  fieldsNotStrings:
    'The `fields` in Clean Publish config ' + 'must be `an array of strings`'
}

const PACKAGE_EXAMPLE =
  '\n' +
  '  "clean-publish": {\n' +
  '    "files": ["file1.js", "file2.js"],\n' +
  '    "packageManager": "yarn"\n' +
  '  }'
const FILE_EXAMPLE =
  '\n' +
  '  {\n' +
  '    "files": ["file1.js", "file2.js"],\n' +
  '    "packageManager": "yarn"\n' +
  '  }'

function isStrings (value) {
  if (!Array.isArray(value)) return false
  return value.every(i => typeof i === 'string')
}

function isStringsOrRegExps (value) {
  if (!Array.isArray(value)) return false
  return value.every(i => typeof i === 'string' || i instanceof RegExp)
}

function isStringsOrUndefined (value) {
  return typeof value === 'undefined' || isStrings(value)
}

function isStringsOrRegExpsOrUndefined (value) {
  return typeof value === 'undefined' || isStringsOrRegExps(value)
}

function capitalize (str) {
  return str[0].toUpperCase() + str.slice(1)
}

function configError (config) {
  if (!isObject(config)) {
    return 'notObject'
  }
  if (Object.keys(config).length === 0) {
    return 'empty'
  }
  if (!isStringsOrRegExpsOrUndefined(config.files)) {
    return 'filesNotStringsOrRegExps'
  }
  if (!isStringsOrUndefined(config.fields)) {
    return 'fieldsNotStrings'
  }
  return false
}

export function getConfig () {
  const explorer = lilconfig('clean-publish', {
    searchPlaces: ['package.json', '.clean-publish', '.clean-publish.js']
  })
  return explorer
    .search()
    .catch(err => {
      if (err.name === 'JSONError') {
        const regexp = /JSON\s?Error\sin\s[^\n]+:\s+([^\n]+)( while parsing)/
        let message = err.message
        if (regexp.test(message)) {
          message = message.match(regexp)[1]
        }
        throw new Error(
          'Can not parse `package.json`. ' +
            message +
            '. ' +
            'Change config according to Clean Publish docs.\n' +
            PACKAGE_EXAMPLE +
            '\n'
        )
      } else if (err.reason && err.mark && err.mark.name) {
        const file = relative(process.cwd(), err.mark.name)
        const position = err.mark.line + ':' + err.mark.column
        throw new Error(
          'Can not parse `' +
            file +
            '` at ' +
            position +
            '. ' +
            capitalize(err.reason) +
            '. ' +
            'Change config according to Clean Publish docs.\n' +
            FILE_EXAMPLE +
            '\n'
        )
      } else {
        throw err
      }
    })
    .then(result => {
      if (result === null) {
        return {}
      }
      const { config } = result
      const error = configError(config)
      if (error) {
        if (/package\.json$/.test(config.filepath)) {
          throw new Error(
            PACKAGE_ERRORS[error] +
              '. ' +
              'Fix it according to Clean Publish docs.' +
              `\n${PACKAGE_EXAMPLE}\n`
          )
        } else {
          throw new Error(
            FILE_ERRORS[error] +
              '. ' +
              'Fix it according to Clean Publish docs.' +
              `\n${FILE_EXAMPLE}\n`
          )
        }
      }
      return config
    })
}
