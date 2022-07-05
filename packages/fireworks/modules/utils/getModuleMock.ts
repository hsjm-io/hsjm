import faker from '@faker-js/faker'
import { Module } from '../types'

/**
 * Returns a mock data object for a given module.
 * @param {Module} module The module to use for generating mock data
 * @returns {T} The mock data object
 */
export const getModuleMock = <T>(module: Module): T => {
  if (!module.fields) return {} as T

  // --- Generate fake values for each fields.
  const result: any = {}
  for (const key in module.fields) {
    const field = module.fields[key] as any
    const resultKey = field.key ?? key
    if (typeof field.faker === 'undefined') result[resultKey] = undefined
    if (typeof field.faker === 'string') result[resultKey] = faker.fake(field.faker)
    if (typeof field.faker === 'function') result[resultKey] = field.faker()
  }

  // --- Return mock object.
  return result
}
