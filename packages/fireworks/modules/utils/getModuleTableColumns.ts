
import { Module, ModuleField } from '../types'

/**
 * Get the table columns for a module
 * @param {Module} module The module to get the columns for
 * @returns {Column[]} The columns for the module
 */
export const getModuleTableColumns = <T>(module?: Module<T>): ModuleField<T>[] => {
  if (!module?.fields) return []

  // --- Get fields as an array and apply the key to each field
  const fields = Object.entries(module.fields)
    .map(([key, field]) => ({ key, ...field }))

  // --- Return fields sorted by order.
  return fields.sort((a, b) => (a.order ?? 1) - (b.order ?? 1)) as ModuleField<T>[]
}
