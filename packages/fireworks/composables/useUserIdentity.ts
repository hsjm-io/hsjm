import { createSharedComposable } from '@vueuse/shared'
import { computed, reactive } from 'vue-demi'
import { Identity, identityModule } from '../modules/coreIdentity'
import { GetOptions, useFirestore } from './useFirestore'
import { useAuth } from './useAuth'

/** Shared composable for current user's `Identity` documents. */
export const useUserIdentity = /* @__PURE__ */ createSharedComposable((options: GetOptions) => {
  const { user } = useAuth()
  const query = reactive({ userId: computed(() => user.value?.uid) })
  return useFirestore<Identity>(identityModule.path, query, {
    sync: true,
    pickFirst: true,
    keepAlive: true,
    initialValue: query,
    ...options,
  })
})
