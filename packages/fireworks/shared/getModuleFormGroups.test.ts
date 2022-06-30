import { expect, it } from 'vitest'
import { defineModule } from './defineModule'
import { getModuleFormGroups } from './getModuleFormGroups'

it('should group the module fields by group', () => {
  const module = defineModule({
    path: 'test',
    fields: {
      field1: { name: 'Foo', group: 'group1' },
      field2: { name: 'Bar', group: 'group2' },
      field3: { name: 'Baz', group: 'group2' },
      field4: { name: 'Baz', group: 'group3' },
    },
    groups: {
      group1: { name: 'Group 1' },
      group2: { name: 'Group 2' },
    },
  })
  const result = getModuleFormGroups(module)
  expect(result).toEqual([
    {
      key: 'group1',
      name: 'Group 1',
      fields: [
        {
          key: 'field1',
          name: 'Foo',
          group: 'group1',
        },
      ],
    },
    {
      key: 'group2',
      name: 'Group 2',
      fields: [
        {
          key: 'field2',
          name: 'Bar',
          group: 'group2',
        },
        {
          key: 'field3',
          name: 'Baz',
          group: 'group2',
        },
      ],
    },
    {
      fields: [
        {
          key: 'field4',
          name: 'Baz',
          group: 'group3',
        },
      ],
    },
  ])
})
