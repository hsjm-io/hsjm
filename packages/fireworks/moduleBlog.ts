import { createSharedFirestore } from '@hsjm/firebase'
import { Data, History } from './types'

export interface BlogPost extends Data, History<BlogPost> {
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
  readonly category?: BlogCategory
}

export interface BlogCategory extends Data {
  image?: string
  description?: string
  postIds?: string[]
  readonly posts?: BlogPost[]
}

export const useBlogPosts = createSharedFirestore<BlogPost>('blogPosts')
export const useBlogCategories = createSharedFirestore<BlogCategory>('blogCategories')
