import { arrayify, defaultToContext, isArray, isArrayNotEmpty, isArrayOf, isNotUndefined, isStringFirestoreId, isStringNotEmpty, isStringTimestamp, isUndefined, kebabCase, toContext, trim } from '@hsjm/shared'
import { FirestoreReference, defineModule, isUserId, toFirestoreIdentity } from '../shared'
import { Asset } from './coreAsset'
import { Identity } from './coreIdentity'

/** Data properties common to all documents. */
export interface Data {
  /**
   * ID of the record.
   * @required Must be a valid Firestore ID.
   * @readonly Cannot be changed once in the database.
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

/** Data schema. */
export const dataSchema = defineModule({
  collection: 'data',
  fields: [
    {
      name: 'id',
      label: 'Identifiant interne du document',
      group: 'internal',
      isReadonly: true,
      rules: [[isStringFirestoreId], [isUndefined]],
    },
    {
      name: 'name',
      label: 'Nom du document',
      rules: [isStringNotEmpty, trim],
    },
    {
      name: 'slug',
      label: 'Nom interne du document',
      group: 'internal',
      isReadonly: true,
      rules: [
        [isStringNotEmpty],
        [[defaultToContext, 'name'], kebabCase],
      ],
    },

    // TODO: Add `thumbnail` and `thumbnailUrl` fields.
    // {
    //   name: 'thumbnail',
    // },
    // {
    //   name: 'thumbnailUrl',
    // },

    {
      name: 'ownerIds',
      label: 'Identifiant des propriétaires du document',
      group: 'internal',
      isHidden: true,
      isReadonly: true,
      rules: [
        [isArray, isArrayNotEmpty, [isArrayOf, [isUserId]]],
        [[defaultToContext, 'updatedById'], arrayify],
      ],
    },
    {
      name: 'owners',
      label: 'Propriétaires du document',
      group: 'internal',
      isReadonly: true,
      rules: [
        [isArrayNotEmpty],
        [[defaultToContext, 'updatedById'], toFirestoreIdentity, arrayify],
      ],
    },
    {
      name: 'createdById',
      label: 'Identifiant du créateur du document',
      group: 'internal',
      isHidden: true,
      isReadonly: true,
      rules: [
        [isUserId],
        [[defaultToContext, 'updatedById']],
      ],
    },
    {
      name: 'createdBy',
      label: 'Créateur du document',
      group: 'internal',
      isReadonly: true,
      rules: [
        [isNotUndefined],
        [[defaultToContext, 'updatedById'], toFirestoreIdentity],
      ],
    },
    {
      name: 'updatedById',
      label: 'Identifiant du dernier éditeur',
      group: 'internal',
      isHidden: true,
      isReadonly: true,
      rules: [isUserId],
    },
    {
      name: 'updatedBy',
      label: 'Dernier éditeur',
      group: 'internal',
      isReadonly: true,
      rules: [[toContext, 'updatedById'], toFirestoreIdentity],
    },
    {
      name: 'createdAt',
      label: 'Date de création du document',
      group: 'internal',
      isReadonly: true,
      rules: [
        [isStringTimestamp],
        [[defaultToContext, 'context.timestamp'], isStringTimestamp],
      ],
    },
    {
      name: 'updatedAt',
      label: 'Dernier éditeur',
      group: 'internal',
      isReadonly: true,
      rules: [[toContext, 'context.timestamp'], isStringTimestamp],
    },
  ],

  groups: [
    {
      name: 'informations',
      label: 'Informations',
    },
    {
      name: 'internal',
      label: 'Champs internes',
      description: 'Informations de deboggage',
    },
  ],
})
