import { createSharedComposable } from '@vueuse/shared'
import { DocumentData } from 'firebase/firestore'
import { UseFirestoreReturnType, useFirestore } from '../useFirestore'

/**
 * Returns a composable factory function for creating shared Firestore hooks.
 * @param {string} path The path to the collection
 * @returns {() => UseFirestoreReturnType<T>} The shared Firestore hook
 */
export const createSharedFirestore = <T extends DocumentData>(path: string): () => UseFirestoreReturnType<T> =>
  createSharedComposable(() => useFirestore<T>(path))
