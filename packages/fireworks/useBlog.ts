import { createSharedFirestore } from '@hsjm/firebase'

export interface BlogPost {
  readonly id: string
  /** Internal name. */
  readonly slug: string
  /** Display name. */
  name: string
  /** Content of the article. */
  content: string
  /** ID of the category the blog post is in. */
  categoryId: string
}

export interface BlogCategory {
  /** ID of the blog cate. */
  readonly id: string
  /** Internal name. */
  readonly slug: string
  /** Display name. */
  name: string
  /** Content of the article. */
  content: string
}

export const useBlogPosts = createSharedFirestore<BlogPost>('blogPosts')
export const useBlogCategories = createSharedFirestore<BlogCategory>('blogCategories')
