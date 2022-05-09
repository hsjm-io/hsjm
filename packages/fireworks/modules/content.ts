import { createSharedFirestore } from '@hsjm/firebase'
import { Schema, isBoolean, isNumberPositive, isStringMatching, isStringNotEmpty, isStringUrl, isUndefined } from '@hsjm/shared'
import { Data } from './data'

export interface Content extends Data {
  type: 'service' | 'testimonial' | 'legal' | 'privacy' | 'about'
  content: string
  description?: string
  subtype?: string
  image?: string
  order?: number
  isPrivate?: boolean
}

export const contentSchema: Schema = {
  type: [isStringMatching, /^(?:service|testimonial|legal|privacy|about)$/],
  content: [isStringNotEmpty],
  description: [[isUndefined], [isStringNotEmpty]],
  subtype: [[isUndefined], [isStringNotEmpty]],
  image: [[isUndefined], [isStringUrl]],
  order: [[isUndefined], [isNumberPositive]],
  isPrivate: [[isUndefined], [isBoolean]],
}

export const useContents = createSharedFirestore<Content>('contents')
