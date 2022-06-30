import { Module } from './types'

/**
 * Defines a module.
 * @param {Module} module The module schema
 * @returns {Module} The defined module
 */
export const defineModule = <T>(module: Module<T>): Module<T> => module
