import { createSharedFirestore } from '@hsjm/firebase'
import { createGlobalState } from '@vueuse/shared'

interface Metadata {
  id: string
  /** Internal name */
  slug: string
  /** Display name. */
  name: string
  /** Cannonical URL of the app. */
  url: string
  /** Meta title. */
  title: string
  /** Meta description. */
  description: string
  /** Meta image URL. */
  image: string
  /** Meta-tags. */
  tags: string[]
  /** Legal name of the company. */
  legalName: string
  /** Legal address of the company. */
  legalAddress: string
  /** Contact email of the company. */
  contactEmail: string
  /** Contact phone number the company. */
  contactPhone: string
  /** Array of social links of the company. */
  contactSocials: string[]
  /** Banner text. */
  bannerText: string
  /** Banner CTA link. */
  bannerUrl: string
}

export interface LegalTerms {
  id: string
  /** Internal name */
  slug: string
  /** Display name. */
  name: string
  /** Content of the article */
  content: string
  /** Order index */
  order: number
  /** Category. */
  category: 'terms' | 'privacy'
}

export const useMetadata = createSharedFirestore<Partial<Metadata>>('metadata')
export const useLegalTerms = createSharedFirestore<Partial<LegalTerms>>('legalTerms')

/** Default website metadata. */
export const useDefaultMetadata = createGlobalState(() => useMetadata().get('default', {}, { keepAlive: true, onSnapshot: false }))
