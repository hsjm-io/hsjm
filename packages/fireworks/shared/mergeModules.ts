import { mergeDeep, uniqBy } from '@hsjm/shared'
import { Module } from './types'
/**
 * Merge multiple modules and make sure there a not duplicate fields or groups
 * @param {...Module[]} modules Modules to merge together
 * @returns {Module} A new module
 */
export const mergeModules = (...modules: Module[]): Module => {
  const newModule = mergeDeep(...modules)
  newModule.fields = uniqBy(newModule.fields.reverse(), 'name').reverse()
  if (newModule.groups) newModule.groups = uniqBy(newModule.groups.reverse(), 'name').reverse()
  return newModule
}
