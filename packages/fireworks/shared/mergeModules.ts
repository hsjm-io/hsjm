import { uniqBy } from '@hsjm/shared'
import { Module } from './types'

/**
 * Merges multiple module schemas into a single schema.
 * @param {Module[]} modules The module schemas to merge
 * @returns {Module} The merged module schema
 */
export const mergeModules = (...modules: Module[]): Module => {
  const fields = uniqBy([] ?? modules.flatMap(x => x.fields), 'name')
  const groups = uniqBy([] ?? modules.flatMap(x => x.groups), 'name')
  const collection = modules.map(x => x.collection)?.[0]
  return { collection, fields, groups }
}
