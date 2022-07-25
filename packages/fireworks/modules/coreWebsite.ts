import { isArray, isArrayValid, isNil, isString, isStringEmail, isStringNotEmpty, isStringShorterOrEq, isStringUrl, map, toContext, toKebabCase, trim } from '@hsjm/shared'
import { mergeModules } from './utils'
import { Data, dataModule } from './coreData'

/** Module for the website's parameters. */
export interface Website extends Data {
  /** The url of the website. */
  cannonicalUrl: string
  /** OG:The name of the website. */
  metaTitle: string
  /** OG:The description of the website.  */
  metaDescription?: string
  /** OG:image URL. */
  metaImage?: string
  /** OG:meta tags. */
  metaTags?: string[]
  /** Legal identifier of the company owning the website. */
  legalIdentifier?: string
  /** Legal name of the website's owner. */
  legalName?: string
  /** Legal address of the website's owner. */
  legalAddress?: string
  /** Contact email. */
  contactEmail?: string
  /** Contact phone number. */
  contactPhone?: string
  /** Social media links. */
  contactSocials?: string[]
  /** Banner text. */
  bannerText?: string
  /** URL to navigate to when the user clicks on the banner. */
  bannerTo?: string
}

/** Module for `Website` documents. */
export const websiteModule = /** @__PURE__ */ mergeModules<Website>(dataModule, {
  path: 'website',
  fields: {
    cannonicalUrl: {
      name: 'cannonicalUrl',
      rules: [
        [isString, trim, isStringUrl],
        [isNil],
      ],
    },
    metaTitle: {
      name: 'Titre de la page (balise meta)',
      rules: [
        [isString, [isStringShorterOrEq, 60]],
        [isNil],
      ],
    },
    metaDescription: {
      name: 'Description de la page (balise meta)',
      rules: [isStringNotEmpty, [isStringShorterOrEq, 160], trim],
    },
    metaImage: {
      name: 'Image de la page (balise meta)',
      rules: [
        [isStringUrl],
        [isNil],
      ],
    },
    metaTags: {
      name: 'Mots clés de la page (balise meta)',
      rules: [
        [
          isArray,
          [isArrayValid, [isStringNotEmpty]],
          [map, [trim]],
          [map, [toKebabCase]],
        ],
        [isNil],
      ],
    },
    legalId: {
      name: 'Identifiant légal de l\'entreprise',
      rules: [
        [isStringNotEmpty],
        [isNil],
      ],
    },
    legalName: {
      name: 'Nom légal de l\'entreprise',
      rules: [
        [isStringNotEmpty],
        [isNil, [toContext, 'metaTitle'], trim],
      ],
    },
    legalAddress: {
      name: 'Adresse postale du site',
      rules: [
        [isStringNotEmpty],
        [isNil],
      ],
    },
    contactEmail: {
      name: 'Adresse e-mail de contact',
      rules: [
        [isStringEmail],
        [isNil],
      ],
    },
    contactPhone: {
      name: 'Numéro de téléphone de contact',
      rules: [
        [isStringNotEmpty],
        [isNil],
      ],
    },
    contactSocials: {
      name: 'Comptes de réseaux sociaux du site',
      rules: [
        [[isArrayValid, [isStringUrl]]],
        [isNil],
      ],
    },
    bannerText: {
      name: 'Texte du bandeau en haut de la page (max 60 caractères)',
      rules: [
        [isStringNotEmpty, [isStringShorterOrEq, 60]],
        [isNil],
      ],
    },
    bannerHref: {
      name: 'Lien du bandeau en haut de la page',
      rules: [
        [isStringUrl],
        [isNil],
      ],
    },
  },
})
