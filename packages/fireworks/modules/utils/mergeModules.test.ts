import { expect, it } from 'vitest'
import { mergeModules } from './mergeModules'

const isString = (v: any) => typeof v === 'string'
const isNumber = (v: any) => typeof v === 'number'

it('should merge modules', () => {
  const module1 = {
    path: 'module1',
    fields: {
      field1: {
        name: 'Field 1',
        group: 'group1',
        rules: [isString],
      },
      field2: {
        name: 'Field 2',
        group: 'group1',
        rules: [isString],
      },
    },
  }
  const module2 = {
    path: 'module2',
    fields: {
      field1: {
        name: 'Field 1',
        group: 'group1',
        rules: [isNumber],
      },
    },
  }
  const module3 = {
    path: 'module3',
    fields: {
      field3: {
        name: 'Field 3',
        group: 'group2',
        rules: [isNumber],
      },
    },
  }
  const mergedModule = mergeModules(module1, module2, module3)
  expect(mergedModule.path).toEqual('module3')
  expect(mergedModule.fields?.field1.name).toEqual('Field 1')
  expect(mergedModule.fields?.field1.group).toEqual('group1')
  expect(mergedModule.fields?.field1.rules).toEqual([isNumber])
  expect(mergedModule.fields?.field2.name).toEqual('Field 2')
  expect(mergedModule.fields?.field2.group).toEqual('group1')
  expect(mergedModule.fields?.field2.rules).toEqual([isString])
  expect(mergedModule.fields?.field3.name).toEqual('Field 3')
  expect(mergedModule.fields?.field3.group).toEqual('group2')
  expect(mergedModule.fields?.field3.rules).toEqual([isNumber])
})
