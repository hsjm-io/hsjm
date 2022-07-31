/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Key, ValidationRule, ValidationRulePipe, ValidationRuleSet } from '@hsjm/shared'
import { Editor, Input, InputList, InputText } from '@hsjm/core'
import { QueryFilter } from '../utils/firestoreCreateQuery'

/** Firestore Document Reference */
export type FirestoreReference<T = any> = import('firebase/compat/app').default.firestore.DocumentReference<T>

/** Firestore context */
export interface FirebaseContext {
  admin: typeof import('firebase-admin')
  functions: typeof import('firebase-functions')
}

export type ModuleFieldType =
  | { is: 'Input' } & InstanceType<typeof Input>['$props'] & InstanceType<typeof InputText>['$props'] & InstanceType<typeof InputList>['$props']
  | { is: 'Editor' } & InstanceType<typeof Editor>['$props']
  | { is: string } & Record<string, any>
  | Omit<string, keyof string>

export interface ModuleField<T = unknown> {
  /** The key of the field. */
  key?: T extends unknown ? string : Key<T>
  /** The label of the field. */
  name?: string
  /** The description of the field. */
  description?: string
  /** The order of the field. */
  order?: number
  /** The group name of the field. */
  group?: string
  /** Rules set used to validate the field. */
  rules?: ValidationRuleSet | ValidationRulePipe | ValidationRule
  /** A `@faker-js/faker` template or function to use to mock the field. */
  faker?: string | Function
  /** Should the field be hidden in the form, table or everywhere? */
  isHidden?: boolean | 'table' | 'form'
  /** Should the field be disabled in the form, table or everywhere? */
  isReadonly?: boolean
  /** The type of the field. */
  type?: ModuleFieldType
}

export interface ModuleGroup {
  /** The name of the group. */
  name?: string
  /**  The description of the group. */
  description?: string
  /** Order of the group in the list. */
  order?: number
}

export interface ModulePreset<T = any> {
  /** The name of the preset. */
  name?: string
  /**  Description of the preset. */
  description?: string
  /**
   * Query filters to apply when querying with this preset.
   * When not provided, the preset will query all documents of a collection.
   * @see `QueryFilter`
   */
  filter?: string | QueryFilter<T> | ((...parameters: any[]) => QueryFilter<T>)
}

/** Module is a collection of fields and groups. */
export interface Module<T = any> {
  /** Name of the module. */
  name?: string
  /** Description of the module. */
  description?: string
  /** Collection path of the data in Firestore. */
  path: string
  /** Fields of the module. */
  fields?: Record<string, ModuleField<T>>
  /** Groups of the module. */
  groups?: Record<string, ModuleGroup>
  /** Filtering presets of the module. */
  presets?: Record<string, ModulePreset<T>>
}
