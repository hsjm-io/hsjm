/* eslint-disable unicorn/no-null */
import { expect, it } from 'vitest'
import { getType, isType } from './isType'

it('should get the type of a value', () => {
  expect(getType()).toBe('undefined')
  expect(getType(null)).toBe('null')
  expect(getType(true)).toBe('boolean')
  expect(getType(1)).toBe('number')
  expect(getType(BigInt(1))).toBe('bigint')
  expect(getType('foo')).toBe('string')
  expect(getType(Symbol('foo'))).toBe('symbol')
  expect(getType(() => {})).toBe('function')
  expect(getType(/foo/)).toBe('regexp')
  expect(getType(new Date())).toBe('date')
  expect(getType(new Set())).toBe('set')
  expect(getType(new Map())).toBe('map')
  expect(getType(new WeakSet())).toBe('weakset')
  expect(getType(new WeakMap())).toBe('weakmap')
  expect(getType([1, 2, 3])).toBe('array')
  expect(getType({})).toBe('object')
})

it('should return true if the value is of a specific type', () => {
  expect(isType(undefined, 'undefined')).toBe(true)
  expect(isType(null, 'null')).toBe(true)
  expect(isType(true, 'boolean')).toBe(true)
  expect(isType(1, 'number')).toBe(true)
  expect(isType(BigInt(1), 'bigint')).toBe(true)
  expect(isType('foo', 'string')).toBe(true)
  expect(isType(Symbol('foo'), 'symbol')).toBe(true)
  expect(isType(() => {}, 'function')).toBe(true)
  expect(isType(/foo/, 'regexp')).toBe(true)
  expect(isType(new Date(), 'date')).toBe(true)
  expect(isType(new Set(), 'set')).toBe(true)
  expect(isType(new Map(), 'map')).toBe(true)
  expect(isType(new WeakSet(), 'weakset')).toBe(true)
  expect(isType(new WeakMap(), 'weakmap')).toBe(true)
  expect(isType([1, 2, 3], 'array')).toBe(true)
  expect(isType({}, 'object')).toBe(true)
})

it('should return fase if the value is not of a specific type', () => {
  expect(isType(undefined, 'null')).toBe(false)
  expect(isType(null, 'undefined')).toBe(false)
  expect(isType(true, 'string')).toBe(false)
  expect(isType(1, 'boolean')).toBe(false)
  expect(isType(1n, 'number')).toBe(false)
  expect(isType('foo', 'symbol')).toBe(false)
  expect(isType(Symbol('foo'), 'string')).toBe(false)
  expect(isType(() => {}, 'regexp')).toBe(false)
  expect(isType(/foo/, 'function')).toBe(false)
  expect(isType(new Date(), 'set')).toBe(false)
  expect(isType(new Set(), 'date')).toBe(false)
  expect(isType(new Map(), 'weakset')).toBe(false)
  expect(isType(new WeakSet(), 'set')).toBe(false)
  expect(isType(new WeakMap(), 'map')).toBe(false)
  expect(isType([1, 2, 3], 'object')).toBe(false)
  expect(isType({}, 'array')).toBe(false)
})