
import { Module, ModuleField } from './types'

export interface Column extends Partial<ModuleField> {
  key: string
  name?: string
  [x: string]: any
}

/**
 * Get the table columns for a module
 * @param {Module} module The module to get the columns for
 * @returns {Column[]} The columns for the module
 */
export const getModuleTableColumns = (module: Module): Column[] => module.fields
  .filter(x => x.isHidden !== true && x.isHidden !== 'table')
  .map(field => ({
    ...field,
    name: field.label,
    key: field.name,
  }))
