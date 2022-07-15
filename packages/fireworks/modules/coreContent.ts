import { isNil, isNumber, isNumberPositive, isString, isStringNotEmpty, isStringNumberPositive, toContext, toKebabCase } from '@hsjm/shared'
import { mergeModules } from './utils/mergeModules'
import { Asset } from './coreAsset'
import { Data, dataModule } from './coreData'
import { FirestoreReference } from './types'

export interface Content extends Data {
  /**
   * Type slug of the content.
   * @optionnal
   */
  type?: string
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
   * Name of the content's group.
   * @optionnal
   */
  group?: string
  /**
   * Icon of the content.
   * @see https://icones.js.org/ for a list of icons.
   */
  icon: string
  /**
   * Reference of the category of the content.
   * @optionnal Automatically set by default.
   */
  order: number
}

export const contentModule = /* @__PURE__ */ mergeModules<Content>(dataModule, {
  path: 'content',
  fields: {
    type: {
      name: 'Type du contenu',
      rules: [isString, isStringNotEmpty],
      type: {
        type: 'listbox',
        itemText: 'label',
        itemValue: 'value',
        items: [
          { label: 'Page du site', value: 'page' },
          { label: 'Article de blog', value: 'post' },
          { label: 'Terme & conditions', value: 'terms' },
        ],
      },
    },
    name: {
      name: 'Titre du contenu',
      rules: [isString, isStringNotEmpty],
    },
    description: {
      name: 'Description du contenu',
      rules: [
        [isNil],
        [isStringNotEmpty],
      ],
    },
    // cover: {
    //   name: 'Couverture',
    //   rules: [[isNil], [isStringUrl]],
    // },
    // coverUrl: {
    //   name: 'URL de la couverture',
    //   // rules: [[isNil], [isStringUrl]],
    // },
    group: {
      name: 'Groupe du contenu',
      rules: [
        [isNil],
        [isString, isStringNotEmpty],
      ],
    },
    icon: {
      name: 'Icone du contenu',
      rules: [
        [isNil],
        [isString],
      ],
    },
    order: {
      name: 'Ordre du contenu',
      rules: [
        [isNil],
        [isString, isStringNumberPositive, Number.parseInt],
        [isNumber, isNumberPositive, Math.round],
      ],
    },
    content: {
      name: 'Contenu',
      group: 'content',
      isHidden: 'table',
      type: 'Editor',
      rules: [isString, isStringNotEmpty],
    },
    slug: {
      name: 'Nom interne du contenu',
      group: 'content',
      isReadonly: true,
      isHidden: 'table',
      rules: [[toContext, 'value.name'], toKebabCase],
    },
  },
  groups: {
    content: {
      name: 'Contenu',
      description: 'Contenu du document',
      order: 1,
    },
  },
})
