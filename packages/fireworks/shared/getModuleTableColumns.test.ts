import { expect, it } from 'vitest'
import { getModuleTableColumns } from './getModuleTableColumns'

it('should extract the table columns of a module', () => {
  const module = {
    collectionPath: 'test',
    fields: {
      field1: { order: 2, key: 'FIELD1', name: 'Field 1' },
      field2: { order: 1, name: 'Field 2' },
      field3: { order: 0, name: 'Field 3' },
    },
  }
  const result = getModuleTableColumns(module)
  expect(result).toEqual([
    { order: 0, key: 'field3', name: 'Field 3' },
    { order: 1, key: 'field2', name: 'Field 2' },
    { order: 2, key: 'FIELD1', name: 'Field 1' },
  ])
})
