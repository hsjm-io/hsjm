import { createSharedFirestore } from '@hsjm/firebase'
import { FirestoreReference } from '../utils'
import { BlogCategory } from './blogCategory'
import { Data } from './data'

export interface BlogPost extends Data {
  image?: string
  content?: string
  description?: string
  isPublished?: boolean

  // --- Computed
  readonly metaTitle?: string
  readonly metaDescription?: string
  readonly metaImage?: string

  // --- Category
  categoryId?: string
  readonly category?: FirestoreReference<BlogCategory>
}

export const useBlogPosts = createSharedFirestore<BlogPost>('blogPosts')
