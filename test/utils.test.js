import { test } from 'uvu'
import { equal, is } from 'uvu/assert'

import { filterObjectByKey, isObject, parseListArg } from '../utils.js'

test('parseListArg parses arg as list', () => {
  equal(parseListArg('foo,bar,baz'), ['foo', 'bar', 'baz'])
})

test('parseListArg trims spaces', () => {
  equal(parseListArg(' foo , bar , baz '), ['foo', 'bar', 'baz'])
})

test('isObject returns true for object', () => {
  is(isObject({}), true)
})

test('isObject returns false for null', () => {
  is(isObject(null), false)
})

test('isObject returns false for non-object', () => {
  is(isObject('str'), false)
})

const obj = {
  a: true,
  b: 123,
  c: 'str',
  d: {
    a: false,
    b: 321
  },
  e: []
}

test('filterObjectByKey does not change object', () => {
  is(filterObjectByKey(obj), obj)
})

test('filterObjectByKey filters key on first level', () => {
  const result = filterObjectByKey(obj, k => k !== 'd')
  const expected = {
    a: obj.a,
    b: obj.b,
    c: obj.c,
    e: obj.e
  }

  equal(result, expected)
  is.not(result, obj)
})

test('filterObjectByKey does not change subobject', () => {
  const result = filterObjectByKey(obj, k => k !== 'e', true)
  const expected = {
    a: obj.a,
    b: obj.b,
    c: obj.c,
    d: obj.d
  }

  equal(result, expected)
  is.not(result, obj)
  is(result.d, obj.d)
})

test('filterObjectByKey filters key on all levels', () => {
  const result = filterObjectByKey(obj, k => k !== 'c', true)
  const expected = {
    a: obj.a,
    b: obj.b,
    d: {
      a: obj.d.a,
      b: obj.d.b
    },
    e: obj.e
  }

  equal(result, expected)
  is.not(result, obj)
  is(result.d, obj.d)
})

test.run()
