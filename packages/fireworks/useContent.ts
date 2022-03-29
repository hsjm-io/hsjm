import { createSharedFirestore } from '@hsjm/firebase'

export interface Testimonial {
  readonly id: string
  /** Internal name. */
  readonly slug: string
  /** Display name. */
  name: string
  /** Content of the testimonial. */
  content: string
}

export interface Content {
  readonly id: string
  /** Internal name. */
  readonly slug: string
  /** Display name. */
  name: string
  /** Type of the content. */
  type: string
  /** Content of the testimonial. */
  content: string
}

export const useContents = createSharedFirestore<Content>('contents')
export const useTestimonials = createSharedFirestore<Testimonial>('testimonials')
