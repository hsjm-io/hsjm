import { createUnrefFn } from '@vueuse/core'
import { DocumentData } from 'firebase/firestore'
import { MaybeRef, createSharedComposable } from '@vueuse/shared'
import { computed, unref } from 'vue-demi'
import { erase } from './utils/erase'
import { save } from './utils/save'
import { QueryFilter } from './utils/createQuery'
import { GetOptions, GetResult, get } from './utils/get'

export interface UseFirestoreReturnType<T = DocumentData> {
  /**
   * Fetch data from collection and bind it to a `Ref`
   * @param filter ID or filter parameters.
   * @param options Custom parameters.
   */
  get: {
    (filter: QueryFilter, options?: GetOptions & { pickFirst: true }): GetResult<T>
    (filter: QueryFilter, options?: GetOptions): GetResult<T[]>
    (filter: MaybeRef<string | null | undefined>, options?: GetOptions): GetResult<T>
  }

  /**
   * Save document(s) to collection.
   * @param data Document(s) and/or ID(s) to save.
   */
  save: (data: MaybeRef<T> | Array<T>) => Promise<void>

  /**
   * Create a shared instance of methods to manipulate data from Firestore.
   * @param path Path to collection.
   */
  erase: (data: MaybeRef<string | T> | Array<string | T>) => Promise<void>

  /**
   * Instiate a new composable targetting a specific sub-collection path from Firestore.
   * @param path Path to collection.
   */
  collection: <T = DocumentData>(...pathSegments: MaybeRef<string>[]) => UseFirestoreReturnType<T>
}

/**
 * Instiate a composable targetting a specific collection path from Firestore.
 * @param path Path to collection.
 */
export const useFirestore = <T>(...pathSegments: MaybeRef<string>[]): UseFirestoreReturnType<T> => {
  const path = pathSegments.map(unref).join('/')
  return {
    get: get.bind(undefined, path) as any,
    save: createUnrefFn(save).bind(undefined, path),
    erase: createUnrefFn(erase).bind(undefined, path),
    collection: (...subSegments) => useFirestore(computed(() => [...pathSegments, ...subSegments].map(unref).join('/'))),
  }
}

export const createSharedFirestore = <T extends DocumentData>(path: string) =>
  createSharedComposable(() => useFirestore<T>(path))
