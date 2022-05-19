import { createSharedComposable } from '@vueuse/shared'
import { DocumentData } from 'firebase/firestore'
import { useFirestore } from '../useFirestore'

export const createSharedFirestore = <T extends DocumentData>(path: string) =>
  createSharedComposable(() => useFirestore<T>(path))
