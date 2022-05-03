import { createGlobalState } from '@vueuse/shared'
import { createSharedFirestore } from '@hsjm/firebase'
import { Data, Hierarchy, History } from './base'

export interface Content extends Data, History<Content>, Hierarchy<Content> {
  type?: 'service' | 'testimonial' | 'legal' | 'privacy' | 'about'
  subtype?: string
  image?: string
  content?: string
  order?: number
  isPrivate?: boolean
}

interface Metadata extends Data {
  url: string
  metaTitle: string
  metaDescription: string
  metaImage: string
  metaTags: string[]
  legalName: string
  legalAddress: string
  contactEmail: string
  contactPhone: string
  contactSocials: string[]
  bannerText: string
  bannerUrl: string
}

export const useContents = createSharedFirestore<Content>('contents')
export const useMetadatas = createSharedFirestore<Partial<Metadata>>('metadata')
export const useDefaultMetadata = createGlobalState(() => useMetadatas().get('default', {}, { keepAlive: true, onSnapshot: false }))
