import { expect, it } from 'vitest'
import { getModuleValidationSchema } from './getModuleValidationSchema'

const isNumber = (value: any) => typeof value === 'number'
const isString = (value: any) => typeof value === 'string'

it('should extract the validation schema of a module', () => {
  const module = {
    collectionPath: 'test',
    fields: {
      field1: { rules: [isNumber], key: 'FIELD1' },
      field2: { rules: [isString] },
      field3: {},
    },
  }

  const result = getModuleValidationSchema(module)
  expect(Object.keys(result)).toEqual(['FIELD1', 'field2'])
  expect(result.FIELD1).toEqual([isNumber])
  expect(result.field2).toEqual([isString])
})
