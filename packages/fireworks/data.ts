import { Schema, arrayify, defaultToContext, isArray, isArrayNotEmpty, isArrayOf, isBrowser, isNotUndefined, isStringFirestoreId, isStringNotEmpty, isStringTimestamp, isUndefined, kebabCase, toContext, trim } from '@hsjm/shared'
import { FirestoreReference, isUserId, toFirestoreIdentity } from './utils'
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
  name: [
    isStringNotEmpty, trim,
  ],

  // --- Slug can be set or will be defaulted to kebabCased `name`.
  slug: [
    [isStringNotEmpty],
    [[defaultToContext, 'name'], kebabCase],
  ],

  // --- Owner ids must be an array of firestore ids or will be defaulted to request's author id.
  ownerIds: [
    [isArray, isArrayNotEmpty, [isArrayOf, [isUserId]]],
    [[defaultToContext, 'updatedById'], arrayify],
  ],

  owners: [
    [isArrayNotEmpty],
    [[defaultToContext, 'updatedById'], toFirestoreIdentity, arrayify],
  ],

  createdById: [
    [isUserId],
    [[defaultToContext, 'updatedById']],
  ],

  createdBy: [
    [isNotUndefined],
    [[defaultToContext, 'updatedById'], toFirestoreIdentity],
  ],

  updatedById: [isUserId],
  updatedBy: [[toContext, 'updatedById'], toFirestoreIdentity],

  // --- Default to current timestamp.
  createdAt: [
    [isStringTimestamp],
    [[defaultToContext, 'context.timestamp'], isStringTimestamp],
  ],

  // --- Force value to current timestamp.
  updatedAt: [
    [toContext, 'context.timestamp'], isStringTimestamp,
  ],
}

/** Data schema */
export const dataSchema = isBrowser
  ? dataSchemaClient
  : dataSchemaServer
