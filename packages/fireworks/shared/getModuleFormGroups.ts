import { groupBy, map, sortBy } from '@hsjm/shared'
import { Module, ModuleField, ModuleGroup } from './types'

export interface ModuleFormGroup extends Partial<ModuleGroup> {
  fields: ModuleField[]
}

/**
 * Gets the form groups for a module.
 * @param {Module} module The module
 * @returns {ModuleFormGroup[]} The module's form groups
 */
export const getModuleFormGroups = (module: Module): ModuleFormGroup[] => {
  // --- Group fields by group
  const groupedFields = groupBy(module.fields, 'group')

  // --- Add fields to group objects.
  const formGroups = map(groupedFields, (fields, groupName) => ({
    ...module.groups?.find(group => group.name === groupName),
    fields: fields.filter(x => x.isHidden !== true && x.isHidden !== 'form'),
  }))

  // --- Return groups sorted by order.
  return sortBy(formGroups, 'order')
}
