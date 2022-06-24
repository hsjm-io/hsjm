import { groupBy, map } from '@hsjm/shared'
import { Module } from './types'

/**
 * Gets the form groups for a module.
 * @param module The module
 * @returns The module's form groups
 */
export const getModuleFormGroups = (module: Module) => {
  const groupedFields = groupBy(module.fields, 'group')
  return map(groupedFields, (fields, groupName) => {
    const group = module.groups?.find(group => group.name === groupName)
    return { ...group, fields }
  })
}
