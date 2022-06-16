import { ValidationSchema, mapKeys, mapValues } from '@hsjm/shared'
import { Module } from './types'

/**
 * Gets the validation schema for a module's fields.
 * @param {Module} module The module to get the schema for
 * @returns {ValidationSchema} The module's validation schema
 */
export const getModuleValidationSchema = (module: Module): ValidationSchema => {
  const fieldsKeyed = mapKeys(module.fields, 'name')
  const fieldsRules = mapValues(fieldsKeyed, 'rules') as ValidationSchema
  return fieldsRules
}
