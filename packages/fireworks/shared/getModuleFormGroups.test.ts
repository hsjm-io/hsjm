import { expect, it } from 'vitest'
import { getModuleFormGroups } from './getModuleFormGroups'

it('should group the module fields by group', () => {
  const module = {
    collection: 'test',
    fields: [
      { name: 'field1', group: 'group1' },
      { name: 'field2', group: 'group2' },
      { name: 'field3' },
    ],
    groups: [
      { name: 'group1', label: 'Group 1' },
      { name: 'group2', label: 'Group 2' },
    ],
  }

  const result = getModuleFormGroups(module)

  expect(result).toEqual([
    {
      name: 'group1',
      label: 'Group 1',
      fields: [
        { name: 'field1', group: 'group1' },
      ],
    },
    {
      name: 'group2',
      label: 'Group 2',
      fields: [
        { name: 'field2', group: 'group2' },
      ],
    },
    {
      fields: [
        { name: 'field3' },
      ],
    },
  ])
})
