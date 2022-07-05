import { isStringNotEmpty, isStringUrl } from '@hsjm/shared'
import { mergeModules } from './utils/mergeModules'
import { Data, dataModule } from './coreData'

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

export const assetModule = /* @__PURE__ */ mergeModules<Asset>(dataModule, {
  path: 'assets',
  fields: {
    url: {
      name: 'URL du fichier',
      rules: [
        [isStringUrl],
        [isStringNotEmpty],
      ],
    },
    description: {
      name: 'Description du fichier',
      rules: [isStringNotEmpty],
    },
  },
})
