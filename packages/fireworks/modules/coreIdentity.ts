import { arrayify, isArrayValid, isNil, isString, isStringEmail, isStringNotEmpty, isStringUrl, toEmptyArray, toKebabCase, trim } from '@hsjm/shared'
import { isFirestoreUserId, mergeModules } from './utils'
import { Data, dataModule } from './coreData'

export interface Identity extends Data {
  image: string
  readonly name: string
  firstName?: string
  lastName?: string
  title?: string
  avatar?: string
  contactEmails?: string[]
  contactPhones?: string[]
  contactSocials?: string[]
  organizationIds?: string[]
  // readonly organizations?: FirestoreReference<Organization>[]
  /**
   * User ID assigned to this user.
   * @optionnal
   */
  readonly userId?: string
}

const toFullname = function(this: any) {
  return [this.value.firstName, this.value.lastName].filter(Boolean).join(' ').trim()
}

/** Module for `Identity` documents. */
export const identityModule = /* @__PURE__ */ mergeModules<Identity>(dataModule, {
  path: 'identity',
  fields: {
    image: {
      name: 'Avatar',
      group: 'informations',
      rules: [
        [isNil],
        [isStringUrl],
      ],
    },
    name: {
      name: 'Nom complet',
      group: 'informations',
      isReadonly: true,
      isHidden: 'table',
      rules: [toFullname],
    },
    slug: {
      name: 'URL du profil',
      group: 'internal',
      isReadonly: true,
      isHidden: true,
      rules: [toFullname, toKebabCase],
    },
    firstName: {
      name: 'Prénom',
      group: 'informations',
      rules: [isString, isStringNotEmpty, trim],
    },
    lastName: {
      name: 'Nom de famille',
      group: 'informations',
      rules: [
        [isString, isStringNotEmpty, trim],
        [isNil],
      ],
    },
    title: {
      name: 'Titre / Profession',
      group: 'informations',
      rules: [
        [isString, isStringNotEmpty, trim],
        [isNil],
      ],
    },
    contactEmails: {
      name: 'Adresse(s) email de contact',
      group: 'informations',
      rules: [
        [arrayify, [isArrayValid, [isStringEmail], 'isStringEmail']],
        [isNil, toEmptyArray],
      ],
    },
    contactSocials: {
      name: 'Liens sociaux',
      group: 'informations',
      rules: [
        [arrayify, [isArrayValid, [isStringUrl], 'isStringUrl']],
        [isNil, toEmptyArray],
      ],
    },
    contactPhones: {
      name: 'Numero(s) de téléphone de contact',
      group: 'informations',
      rules: [
        [arrayify, [isArrayValid, [isStringNotEmpty], 'isStringNotEmpty']],
        [isNil, toEmptyArray],
      ],
    },
    userId: {
      name: 'Identifiant de l\'utilisateur',
      group: 'internal',
      rules: [
        [isString, isFirestoreUserId],
        [isNil],
      ],
    },
  },
  groups: {
    informations: {
      name: 'Mes informations',
      description: 'Informations sur mon profil et mon identité',
    },
  },
  presets: {
    default: {},
    currentUser: { filter: (userId: string) => ({ userId }) },
  },
})
