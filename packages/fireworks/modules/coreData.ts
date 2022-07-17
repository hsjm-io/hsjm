import { arrayify, isArray, isArrayNotEmpty, isNil, isString, isStringNotEmpty, isStringTimestamp, toContext, toKebabCase, trim } from '@hsjm/shared'
import { defineModule, isFirestoreReference, isFirestoreUserId, isFirestoreUserIds, toFirestoreIdentity } from './utils'
import { Asset } from './coreAsset'
import { Identity } from './coreIdentity'
import { FirestoreReference } from './types'

/** Data properties common to all documents. */
export interface Data {
  /**
   * ID of the record.
   * @required Must be a valid Firestore ID.
   * @readonly Once set, cannot be changed in the database.
   */
  readonly id: string
  /**
   * Display name of the record.
   * @required Must not be and empty string.
   */
  name: string
  /**
   * Internal uniaue name of the record. Used for routing.
   * @required Must not be and empty kebab-cased string.
   */
  slug: string
  /**
   * Reference of the a thumbnail representing the document.
   */
  thumbnail?: FirestoreReference<Asset>[]
  /**
   * Thumbnail URL representing the document. Must be a URL.
   * @readonly Computed from the `thumbnail` field.
   */
  readonly thumbnailUrl?: string
  /**
   * User ID of the owners of this document.
   * This allows users complete access to the record.
   * @required Must not be and empty kebab-cased string.
   * @default unknown ID of the user that created the document.
   */
  ownerIds: string[]
  /**
   * User references of the owners of this record.
   * @readonly Computed from the `ownerIds` field.
   */
  readonly owners: FirestoreReference<Identity>[]
  /**
   * ID of the user that created the document.
   * @readonly Automatically set.
   */
  readonly createdById: string
  /**
   * ID of the user that was the last to edit the document.
   * @readonly Automatically set.
   */
  readonly updatedById: string
  /**
   * Reference of the user that created the document.
   * @readonly Computed from the `createdById` field.
   */
  readonly createdBy: FirestoreReference<Identity>
  /**
   * Reference of the user that was the last to edit the document.
   * @readonly Computed from the `updatedById` field.
   */
  readonly updatedBy: FirestoreReference<Identity>
  /**
   * Timestamp of the document's creation.
   * @readonly Automatically set.
   */
  readonly createdAt: string
  /**
   * Timestamp of the last document's edit.
   * @readonly Automatically set.
   */
  readonly updatedAt: string
}

/** Data Module. */
export const dataModule = /* @__PURE__ */ defineModule<Data>({
  path: 'data',
  fields: {
    id: {
      name: 'Identifiant interne du document',
      group: 'internal',
      isReadonly: true,
      isHidden: 'table',
      rules: [
        [isString, isStringNotEmpty],
        [isNil],
      ],
    },
    name: {
      name: 'Nom du document',
      rules: [isString, isStringNotEmpty, trim],
      order: 0,
    },
    slug: {
      name: 'Nom interne du document',
      group: 'internal',
      isReadonly: true,
      isHidden: 'table',
      rules: [
        [isString, isStringNotEmpty, toKebabCase],
        [isNil, [toContext, 'value.name'], toKebabCase],
      ],
    },

    // TODO: Add `thumbnail` and `thumbnailUrl` fields.
    // {
    //   name: 'thumbnail',
    // },
    // {
    //   name: 'thumbnailUrl',
    // },

    ownerIds: {
      name: 'Identifiant des propriétaires du document',
      group: 'internal',
      isHidden: true,
      isReadonly: true,
      rules: [
        [isArray, isFirestoreUserIds, isArrayNotEmpty],
        [isNil, [toContext, 'value.updatedById'], arrayify],
      ],
    },
    owners: {
      name: 'Propriétaires du document',
      group: 'internal',
      isReadonly: true,
      isHidden: 'table',
      rules: [
        [isArray, isFirestoreUserIds, isArrayNotEmpty],
        [isNil, [toContext, 'value.updatedById'], toFirestoreIdentity, arrayify],
      ],
    },
    updatedById: {
      name: 'Identifiant du dernier éditeur',
      group: 'internal',
      isHidden: true,
      isReadonly: true,
      rules: [isString, isStringNotEmpty, isFirestoreUserId],
    },
    updatedBy: {
      name: 'Dernier éditeur',
      group: 'internal',
      isReadonly: true,
      isHidden: 'table',
      rules: [[toContext, 'value.updatedById'], toFirestoreIdentity],
    },
    createdById: {
      name: 'Identifiant du créateur du document',
      group: 'internal',
      isHidden: true,
      isReadonly: true,
      rules: [
        [isString, isStringNotEmpty, isFirestoreUserId],
        [isNil, [toContext, 'value.updatedById']],
      ],
    },
    createdBy: {
      name: 'Créateur du document',
      group: 'internal',
      isReadonly: true,
      isHidden: 'table',
      rules: [
        [[isFirestoreReference, 'identity']],
        [isNil, [toContext, 'value.updatedById'], toFirestoreIdentity],
      ],
    },
    createdAt: {
      name: 'Date de création du document',
      group: 'internal',
      isReadonly: true,
      isHidden: 'table',
      rules: [
        [isStringTimestamp],
        [isNil, [toContext, 'context.timestamp'], isStringTimestamp],
      ],
    },
    updatedAt: {
      name: 'Date de la dernière modification du document',
      group: 'internal',
      isReadonly: true,
      isHidden: 'table',
      rules: [[toContext, 'context.timestamp'], isStringTimestamp],
    },
  },
  groups: {
    internal: {
      order: 100,
      name: 'Champs internes',
      description: 'Informations de deboggage',
    },
  },
})
