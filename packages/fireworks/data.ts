import { Schema, arrayify, defaultToContext, defaultToValue, isArray, isArrayNotEmpty, isArrayOf, isBrowser, isNotUndefined, isStringFirestoreId, isStringNotEmpty, isStringTimestamp, isUndefined, kebabCase, toContext, toValue, trim } from '@hsjm/shared'
import { FirestoreReference, toFirestoreReference } from './utils'
import { Identity } from './identity'

/** Data properties common to all documents. */
export interface Data {
  name: string
  ownerIds: string[]
  readonly id: string
  readonly slug: string
  readonly owners: FirestoreReference<Identity>[]
  readonly createdById: string
  readonly updatedById: string
  readonly createdBy: FirestoreReference<Identity>
  readonly updatedBy: FirestoreReference<Identity>
  readonly createdAt: string
  readonly updatedAt: string
}

/** Client side data schema. */
const dataSchemaClient: Schema = {
  name: [isStringNotEmpty, trim],
}

/** Server side data schema. */
const dataSchemaServer: Schema = {
  // --- Id can be undefined or matching firestore id regex.
  id: [
    [isStringFirestoreId],
    [[isUndefined, 'dwad']],
  ],

  // --- Name must be set and will be trimmed.
  name: [isStringNotEmpty, trim],

  // --- Slug can be set or will be defaulted to kebabCased `name`.
  slug: [
    [isStringNotEmpty],
    [[defaultToContext, 'name'], kebabCase],
  ],

  // --- Owner ids must be an array of firestore ids or will be defaulted to request's author id.
  ownerIds: [
    [isArray, isArrayNotEmpty, [isArrayOf, [isStringFirestoreId]]],
    [[defaultToContext, 'auth.uid'], isStringFirestoreId, arrayify],
  ],

  owners: [
    [isNotUndefined],
    [[defaultToContext, 'auth.uid'], [toFirestoreReference, 'identities'], arrayify],
  ],

  createdById: [
    [isStringFirestoreId],
    [[defaultToContext, 'auth.uid']],
  ],

  createdBy: [
    [isNotUndefined],
    [[defaultToContext, 'createdById'], [toFirestoreReference, 'identities']],
  ],

  updatedById: [
    [toContext, 'auth.uid'],
  ],

  updatedBy: [
    [toContext, 'auth.uid'], [toFirestoreReference, 'identities'],
  ],

  // --- Default to current timestamp.
  createdAt: [
    [isStringTimestamp],
    [[defaultToValue, new Date().toISOString()], isStringTimestamp],
  ],

  // --- Force value to current timestamp.
  updatedAt: [[toValue, new Date().toISOString()], isStringTimestamp],
}

/** Data schema */
export const dataSchema = isBrowser
  ? dataSchemaClient
  : dataSchemaServer
