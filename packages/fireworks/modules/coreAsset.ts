import { isStringNotEmpty, isStringUrl } from '@hsjm/shared'
import { mergeModules } from '../shared'
import { Data, dataSchema } from './coreData'

export interface Asset extends Data {
  /**
   * URL of the asset.
   * @readonly Automatically set.
   */
  readonly url: string
  /**
   * SHA1 hash of the asset.
   * @readonly Computed from the data.
   */
  readonly sha1: string
  /**
   * Mime  type of the asset.
   * @readonly Computed from the data.
   */
  readonly mime: string
  /**
   * Alternative description of the image for SEO.
   */
  description?: string
}

export const assetSchema = mergeModules(dataSchema, {
  collection: 'assets',
  fields: [
    {
      name: 'url',
      label: 'URL du fichier',
      rules: [[isStringUrl], [isStringNotEmpty]],
    },
    {
      name: 'description',
      label: 'Description du fichier',
      rules: [isStringNotEmpty],
    },
  ],
})
