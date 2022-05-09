import { createSharedFirestore } from '@hsjm/firebase'
import { FirestoreReference } from '../utils'
import { BlogPost } from './blogPost'
import { Data } from './data'

export interface BlogCategory extends Data {
  image?: string
  description?: string
  postIds?: string[]
  readonly posts?: FirestoreReference<BlogPost>[]
}

export const useBlogCategories = createSharedFirestore<BlogCategory>('blogCategories')
