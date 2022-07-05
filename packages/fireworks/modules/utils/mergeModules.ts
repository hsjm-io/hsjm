import { Module } from '../types'
/**
 * Merge multiple modules and make sure there a not duplicate fields or groups
 * @param {...Module[]} modules Modules to merge together
 * @returns {Module} A new module
 */
export const mergeModules = <T>(...modules: Module<any>[]): Module<T> => {
  let newModule = modules[0]

  // --- Merge modules.
  for (const module of modules.slice(1)) {
    newModule = {
      ...newModule,
      ...module,
      fields: { ...newModule.fields, ...module.fields },
      groups: { ...newModule.groups, ...module.groups },
      presets: { ...newModule.presets, ...module.presets },
    }
  }

  // --- Return new module.
  return newModule
}
