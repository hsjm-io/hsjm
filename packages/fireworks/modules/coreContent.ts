import { createSharedFirestore } from '@hsjm/firebase'
import { isNumberPositive, isStringFirestoreId, isStringNotEmpty, isStringUrl, isUndefined } from '@hsjm/shared'
import { FirestoreReference, mergeModules } from '../shared'
import { Asset } from './coreAsset'
import { Data, dataSchema } from './coreData'

export interface Content extends Data {
  /**
   * Reference of a cover image.
   * @optionnal
   */
  cover?: FirestoreReference<Asset>
  /**
   * URL of a cover image.
   * @readonly Computed from the `cover` field.
   */
  coverUrl?: string
  /**
   * Content of the document in markdown form.
   */
  content: string
  /**
   * Short description of the content.
   * @optionnal
   */
  description?: string
  /**
   * ID of the category of the content.
   * @optionnal
   */
  categoryId?: string
  /**
   * Reference of the category of the content.
   * @readonly Computed from the `categoryId` field.
   */
  category?: FirestoreReference<Asset>
  /**
   * Reference of the category of the content.
   * @optionnal Automatically set by default.
   */
  order: number
}

export const contentSchema = mergeModules(dataSchema, {
  collection: 'content',
  fields: [
    {
      name: 'cover',
      label: 'Couverture',
      rules: [[isUndefined], [isStringUrl]],
    },
    {
      name: 'coverUrl',
      label: 'URL de la couverture',
      // rules: [[isUndefined], [isStringUrl]],
    },
    {
      name: 'content',
      label: 'Contenu',
      rules: [isStringNotEmpty],
    },
    {
      name: 'description',
      label: 'Description du contenu',
      type: 'markdown',
      rules: [[isUndefined], [isStringNotEmpty]],
    },
    {
      name: 'categoryId',
      label: 'Description du contenu',
      type: 'reference:contentCategory',
      isHidden: true,
      rules: [[isUndefined], [isStringFirestoreId]],
    },
    {
      name: 'category',
      label: 'Description du contenu',
      type: 'reference:contentCategory',
      // rules: [[isUndefined], [isStringFirestoreId]],
    },
    {
      name: 'order',
      label: 'Ordre du contenu',
      rules: [[isUndefined], [isNumberPositive]],
    },
  ],
})

export const useContent = createSharedFirestore<Content>(contentSchema.collection)
