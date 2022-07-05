import { isNil, isNumberPositive, isStringFirestoreId, isStringNotEmpty, isStringUrl } from '@hsjm/shared'
import { mergeModules } from './utils/mergeModules'
import { Asset } from './coreAsset'
import { Data, dataModule } from './coreData'
import { FirestoreReference } from './types'

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

export const contentModule = /* @__PURE__ */ mergeModules<Content>(dataModule, {
  path: 'content',
  fields: {
    cover: {
      name: 'Couverture',
      rules: [[isNil], [isStringUrl]],
    },
    coverUrl: {
      name: 'URL de la couverture',
      // rules: [[isNil], [isStringUrl]],
    },
    content: {
      name: 'Contenu',
      rules: [isStringNotEmpty],
    },
    description: {
      name: 'Description du contenu',
      type: 'markdown',
      rules: [[isNil], [isStringNotEmpty]],
    },
    categoryId: {
      name: 'ID de la catégorie du contenu',
      type: 'reference:contentCategory',
      isHidden: true,
      rules: [[isNil], [isStringFirestoreId]],
    },
    category: {
      name: 'Catégorie du contenu',
      type: 'reference:contentCategory',
      // rules: [[isNil], [isStringFirestoreId]],
    },
    order: {
      name: 'Ordre du contenu',
      rules: [[isNil], [isNumberPositive]],
    },
  },
})
