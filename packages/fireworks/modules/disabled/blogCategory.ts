import { FirestoreReference } from '../shared/validators'
import { BlogPost } from './blogPost'
import { Data } from './data'

export interface BlogCategory extends Data {
  image?: string
  description?: string
  postIds?: string[]
  readonly posts?: FirestoreReference<BlogPost>[]
}
