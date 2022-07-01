import { Module, ModuleField, ModuleGroup } from './types'

export interface ModuleFormGroup<T = any> extends Partial<ModuleGroup> {
  fields: Array<ModuleField<T> & { key: string }>
}

/**
 * Gets the form groups for a module.
 * @param {Module} module The module
 * @returns {ModuleFormGroup[]} The module's form groups
 */
export const getModuleFormGroups = <T>(module?: Module<T>): ModuleFormGroup<T>[] => {
  if (!module?.fields) return []

  // --- Get fields as an array and apply the key to each field.
  const fields = Object.entries(module.fields)
    .map(([key, field]) => ({ key, ...field }))

  // --- If there is no group, return a single group with the fields.
  if (module.groups === undefined)
    return [{ fields: fields as any }]

  // --- Group fields by group.
  const formGroups = Object.entries(module.groups)

    // --- Create a form group for each group.
    .map(([key, value]) => ({
      key,
      ...value,
      fields: fields.filter(field => field.group === key),
    }))

    // --- Filter out groups with no fields.
    .filter(group => group.fields.length > 0)

  // --- Get fields without group.
  const formGroupKeys = new Set(formGroups.map(group => group.key))
  const fieldsWithoutGroup = fields
    .filter(field => !field.group || !formGroupKeys.has(field.group))
  if (fieldsWithoutGroup.length > 0) formGroups.push({ fields: fieldsWithoutGroup } as any)

  // --- Return groups sorted by order.
  return formGroups.sort((a, b) => (a.order ?? 1) - (b.order ?? 1)) as ModuleFormGroup<T>[]
}
