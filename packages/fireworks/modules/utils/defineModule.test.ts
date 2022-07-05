import { expect, it } from 'vitest'
import { Module } from '../types'
import { defineModule } from './defineModule'

it('should return the module schema when called with a module schema', () => {
  const module = { foo: 'bar' } as unknown as Module
  expect(defineModule(module)).toEqual(module)
})
