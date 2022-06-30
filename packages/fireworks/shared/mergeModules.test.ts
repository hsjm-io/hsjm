import { expect, it } from 'vitest'
import { mergeModules } from './mergeModules'

it('should merge modules', () => {
  const module1 = {
    path: 'module1',
    fields: {
      field1: {
        name: 'Field 1',
        group: 'group1',
        rules: [],
      },
      field2: {
        name: 'Field 2',
        group: 'group1',
        rules: [],
      },
    },
  }
  const module2 = {
    path: 'module2',
    fields: {
      field1: {
        name: 'Field 1',
        group: 'group1',
        rules: [],
      },
      field3: {
        name: 'Field 3',
        group: 'group2',
        rules: [],
      },
    },
  }
  const module3 = {
    path: 'module3',
    fields: {
      field1: {
        name: 'Field 1',
        group: 'group1',
        rules: [],
      },
      field3: {
        name: 'Field 3',
        group: 'group2',
        rules: [],
      },
    },
  }
  const mergedModule = mergeModules(module1, module2, module3)
  expect(mergedModule).toEqual({
    path: 'module3',
    fields: {
      field1: {
        name: 'Field 1',
        group: 'group1',
        rules: [],
      },
      field2: {
        name: 'Field 2',
        group: 'group1',
        rules: [],
      },
      field3: {
        name: 'Field 3',
        group: 'group2',
        rules: [],
      },
    },
  })
})
