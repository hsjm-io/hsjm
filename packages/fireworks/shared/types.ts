import { ValidationRuleSet } from '@hsjm/shared'

export type ModuleFieldType = 'text' | 'markdown' | 'number' | 'slider' | 'asset' | 'image' | `reference:${string}`

export interface ModuleField {
  name: string
  label: string
  group?: string
  description?: string
  rules?: ValidationRuleSet
  type?: ModuleFieldType
  faker?: string | Function
  isHidden?: boolean
  isReadonly?: boolean
}

export interface ModuleGroup {
  name: string
  label: string
  description?: string
}

export interface Module {
  collection: string
  fields: ModuleField[]
  groups?: ModuleGroup[]
}
