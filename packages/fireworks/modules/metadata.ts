import { createSharedFirestore, get } from '@hsjm/firebase'
import { Schema, defaultToContext, isArrayOf, isStringEmail, isStringNotEmpty, isStringShorterOrEq, isStringUrl, isUndefined, trim } from '@hsjm/shared'
import { createGlobalState } from '@vueuse/shared'
import { Data } from './data'

export interface Metadata extends Data {
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

export const metadataSchema: Schema = {
  cannonicalUrl: [[isUndefined], [isStringUrl]],
  metaTitle: [isStringNotEmpty, [isStringShorterOrEq, 60], trim],
  metaDescription: [isStringNotEmpty, [isStringShorterOrEq, 160], trim],
  metaImage: [[isUndefined], [isStringUrl]],
  metaTags: [[isUndefined], [[isArrayOf, [isStringNotEmpty]], trim]],
  legalId: [[isUndefined], [isStringNotEmpty]],
  legalName: [[isStringNotEmpty], [[defaultToContext, 'metaTitle'], trim]],
  legalAddress: [[isUndefined], [isStringNotEmpty]],
  contactEmail: [[isUndefined], [isStringEmail]],
  contactPhone: [[isUndefined], [isStringNotEmpty]],
  contactSocials: [[isUndefined], [[isArrayOf, [isStringUrl]]]],
  bannerText: [[isUndefined], [isStringNotEmpty, [isStringShorterOrEq, 60]]],
  bannerHref: [[isUndefined], [isStringUrl]],
}

export const useMetadatas = createSharedFirestore<Metadata>('metadata')
export const useMetadata = createGlobalState(() => get<Metadata>('metadata', 'default', {
  sync: true,
  pickFirst: true,
  keepAlive: true,
  initialValue: { id: 'default' },
}))
