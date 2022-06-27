import { expect, it } from 'vitest'
import { getModuleValidationSchema } from './getModuleValidationSchema'

const isNumber = (value: any) => typeof value === 'number'
const isString = (value: any) => typeof value === 'string'

it('should extract the validation schema of a module', () => {
  const module = {
    collection: 'test',
    fields: [
      { name: 'field1', rules: [isNumber] },
      { name: 'field2', rules: [isString] },
      { name: 'field3' },
    ],
  }

  const result = getModuleValidationSchema(module)
  expect(Object.keys(result)).toEqual(['field1', 'field2'])
  expect(result.field1).toEqual([isNumber])
  expect(result.field2).toEqual([isString])
})
