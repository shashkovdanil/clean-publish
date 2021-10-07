import { parseListArg, isObject, filterObjectByKey } from '../utils.js'

describe('parseListArg', () => {
  it('should parse arg as list', () => {
    expect(parseListArg('foo,bar,baz')).toEqual(['foo', 'bar', 'baz'])
  })

  it('should trim spaces', () => {
    expect(parseListArg(' foo , bar , baz ')).toEqual(['foo', 'bar', 'baz'])
  })
})

describe('isObject', () => {
  it('should return true for object', () => {
    expect(isObject({})).toBe(true)
  })

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false)
  })

  it('should return false for non-object', () => {
    expect(isObject('str')).toBe(false)
  })
})

describe('filterObjectByKey', () => {
  const obj = {
    a: true,
    b: 123,
    c: 'str',
    d: {
      a: false,
      b: 321,
      c: null
    },
    e: []
  }

  it('should not change object', () => {
    expect(filterObjectByKey(obj)).toBe(obj)
  })

  it('should filter key on first level', () => {
    const result = filterObjectByKey(obj, k => k !== 'd')
    const expected = {
      a: obj.a,
      b: obj.b,
      c: obj.c,
      e: obj.e
    }

    expect(result).toEqual(expected)
    expect(result).not.toBe(obj)
  })

  it('should not change subobject', () => {
    const result = filterObjectByKey(obj, k => k !== 'e', true)
    const expected = {
      a: obj.a,
      b: obj.b,
      c: obj.c,
      d: obj.d
    }

    expect(result).toEqual(expected)
    expect(result).not.toBe(obj)
    expect(result.d).toBe(obj.d)
  })

  it('should filter key on all levels', () => {
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

    expect(result).toEqual(expected)
    expect(result).not.toBe(obj)
    expect(result.d).not.toBe(obj.d)
  })
})
