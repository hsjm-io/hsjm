import faker from '@faker-js/faker'
import { Module } from './types'

/**
 * Returns a mock data object for a given module.
 * @param {module} module The module to use for generating mock data
 * @returns {object} The mock data object
 */
export const getModuleMock = <T>(module: Module): T => {
  const result: any = {}

  // --- Generate fake values for each fields.
  for (const field of module.fields) {
    if (typeof field.faker === 'undefined') result[field.name] = undefined
    if (typeof field.faker === 'string') result[field.name] = faker.fake(field.faker)
    if (typeof field.faker === 'function') result[field.name] = field.faker()
  }

  // --- Return mock object.
  return result
}
