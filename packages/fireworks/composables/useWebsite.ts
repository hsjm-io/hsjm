import { createGlobalState } from '@vueuse/shared'
import { Website, websiteModule } from '../modules/coreWebsite'
import { useFirestore } from './useFirestore'

/** Firestore composable for the `Website` with `id === 'default'`. */
export const useWebsite = /* @__PURE__ */ createGlobalState(() => useFirestore<Website>(
  websiteModule.path,
  'default',
  {
    sync: true,
    pickFirst: true,
    keepAlive: true,
    initialValue: { id: 'default' },
  },
))
