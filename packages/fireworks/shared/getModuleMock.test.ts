import { expect, it } from 'vitest'
import { getModuleMock } from './getModuleMock'
import { Module } from './types'

it('returns a mock data object for a given module', () => {
  const module: Module = {
    path: 'posts',
    fields: {
      id: { faker: () => 42 },
      name: { faker: 'fakeName' },
      email: { faker: '{{internet.email}}' },
    },
  }
  const mock = getModuleMock<any>(module)
  expect(mock.id).toEqual(42)
  expect(mock.name).toEqual('fakeName')
  expect(mock.email).toMatch(/@/)
})
