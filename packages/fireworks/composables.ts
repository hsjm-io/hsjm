import { createSharedFirestore, useAuth, useFirestore } from '@hsjm/firebase'
import { createGlobalState, createSharedComposable } from '@vueuse/shared'
import { BlogCategory, BlogPost, Case, Content, Identity, Metadata, Organization } from './modules'

// --- Core
export const useContents = createSharedComposable(() => useFirestore<Content>('content'))
export const useIdentities = createSharedFirestore<Identity>('identity')
export const useMetadatas = createSharedFirestore<Metadata>('metadata')

// --- Blog
export const useBlogCategories = createSharedFirestore<BlogCategory>('blogCategory')
export const useBlogPosts = createSharedFirestore<BlogPost>('blogPost')

// --- Business
export const useCases = createSharedFirestore<Case>('case')
export const useOrganizations = createSharedFirestore<Organization>('organizations')

// --- Composed
export const useUserIdentity = createGlobalState(() => {
  const { user } = useAuth()
  const { get } = useIdentities()
  return get({ userId: user.value?.uid }, {
    sync: true,
    pickFirst: true,
    keepAlive: true,
    initialValue: { userId: user.value?.uid },
  })
})

export const useMetadata = createGlobalState(() => {
  const { get } = useMetadatas()
  return get('default', {
    sync: true,
    pickFirst: true,
    keepAlive: true,
    initialValue: { id: 'default' },
  })
})
