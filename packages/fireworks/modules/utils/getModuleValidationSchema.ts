import { ValidationSchema } from '@hsjm/shared'
import { Module } from '../types'

/**
 * Gets the validation schema for a module's fields.
 * @param {Module} module The module to get the schema for
 * @returns {ValidationSchema} The module's validation schema
 */
export const getModuleValidationSchema = <T>(module: Module<T>): ValidationSchema => {
  if (!module.fields) return {} as ValidationSchema

  // --- Map the fields to their validation schema
  const entries = Object
    .entries(module.fields)
    .filter(([_key, field]) => !!field.rules)
    .map(([key, field]) => [field.key ?? key, field.rules])

  // --- Return the validation schema
  return Object.fromEntries(entries) as ValidationSchema
}
