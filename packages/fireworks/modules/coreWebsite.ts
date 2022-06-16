import { createSharedFirestore } from '@hsjm/firebase'
import { defaultToContext, isArrayOf, isStringEmail, isStringNotEmpty, isStringShorterOrEq, isStringUrl, isUndefined, trim } from '@hsjm/shared'
import { createSharedComposable } from '@vueuse/shared'
import { mergeModules } from '../shared'
import { Data, dataSchema } from './coreData'

export interface Website extends Data {
  cannonicalUrl: string
  metaTitle: string
  metaDescription: string
  metaImage?: string
  metaTags?: string[]
  legalId?: string
  legalName?: string
  legalAddress?: string
  contactEmail?: string
  contactPhone?: string
  contactSocials?: string[]
  bannerText?: string
  bannerHref?: string
}

export const websiteSchema = mergeModules(dataSchema, {
  collection: 'website',
  fields: [
    {
      name: 'cannonicalUrl',
      label: 'URL du site',
      rules: [[isUndefined], [isStringUrl]],
    },
    {
      name: 'metaTitle',
      label: 'Titre de la page (balise meta)',
      rules: [isStringNotEmpty, [isStringShorterOrEq, 60]],
    },
    {
      name: 'metaDescription',
      label: 'Description de la page (balise meta)',
      rules: [isStringNotEmpty, [isStringShorterOrEq, 160], trim],
    },
    {
      name: 'metaImage',
      label: 'Image de la page (balise meta)',
      rules: [[isUndefined], [isStringUrl]],
    },
    {
      name: 'metaTags',
      label: 'Mots clés de la page (balise meta)',
      rules: [[isUndefined], [[isArrayOf, [isStringNotEmpty]], trim]],
    },
    {
      name: 'legalId',
      label: 'Identifiant légal de l\'entreprise',
      rules: [[isUndefined], [isStringNotEmpty]],
    },
    {
      name: 'legalName',
      label: 'Nom légal de l\'entreprise',
      rules: [[isStringNotEmpty], [[defaultToContext, 'metaTitle'], trim]],
    },
    {
      name: 'legalAddress',
      label: 'Adresse postale du site',
      rules: [[isUndefined], [isStringNotEmpty]],
    },
    {
      name: 'contactEmail',
      label: 'Adresse e-mail de contact',
      rules: [[isUndefined], [isStringEmail]],
    },
    {
      name: 'contactPhone',
      label: 'Numéro de téléphone de contact',
      rules: [[isUndefined], [isStringNotEmpty]],
    },
    {
      name: 'contactSocials',
      label: 'Comptes de réseaux sociaux du site',
      rules: [[isUndefined], [[isArrayOf, [isStringUrl]]]],
    },
    {
      name: 'bannerText',
      label: 'Texte du bandeau en haut de la page (max 60 caractères)',
      rules: [[isUndefined], [isStringNotEmpty, [isStringShorterOrEq, 60]]],
    },
    {
      name: 'bannerHref',
      label: 'Lien du bandeau en haut de la page',
      rules: [[isUndefined], [isStringUrl]],
    },
  ],
})

export const useWebsites = createSharedFirestore<Website>(websiteSchema.collection)
export const useWebsite = createSharedComposable(() => {
  const { get } = useWebsites()
  return get('default', {
    sync: true,
    pickFirst: true,
    keepAlive: true,
    initialValue: { id: 'default' },
  })
})
