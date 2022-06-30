import { mergeDeep } from '@hsjm/shared/collection'
import { Module } from './types'
/**
 * Merge multiple modules and make sure there a not duplicate fields or groups
 * @param {...Module[]} modules Modules to merge together
 * @returns {Module} A new module
 */
export const mergeModules = <T>(...modules: Module<any>[]): Module<T> => mergeDeep(...modules)
