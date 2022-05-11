/* eslint-disable unicorn/prevent-abbreviations */
import { DocumentData } from 'firebase/firestore'
import { MaybeRef, createSharedComposable } from '@vueuse/shared'
import { createUnrefFn } from '@vueuse/core'
import { GetOptions, RefFirestore, get } from './get'
import { erase } from './erase'
import { save } from './save'
import { QueryFilter } from './createQuery'

export interface UseFirestoreReturnType<T = DocumentData> {
  /**
   * Fetch data from collection and bind it to a `Ref`
   * @param filter ID or filter parameters.
   * @param options Custom parameters.
   */
  get: {
    (filter?: MaybeRef<QueryFilter>, options?: GetOptions & { pickFirst: true }): RefFirestore<T>
    (filter?: MaybeRef<QueryFilter>, options?: GetOptions & { pickFirst: false | undefined }): RefFirestore<T[]>
    (filter?: MaybeRef<string | null>, options?: GetOptions): RefFirestore<T>
    (filter?: MaybeRef<string | null | QueryFilter>, options?: GetOptions & { pickFirst: true }): RefFirestore<T>
    (filter?: MaybeRef<string | null | QueryFilter>, options?: GetOptions & { pickFirst: false | undefined }): RefFirestore<T | T[]>
  }

  /**
   * Save document(s) to collection.
   * @param data Document(s) and/or ID(s) to save.
   */
  save: (data: MaybeRef<T | T[]>) => Promise<void>

  /**
    * Erase document(s) from collection.
    * @param data Document(s) and/or ID(s) to erase.
    */
  erase: (data: MaybeRef<string | T | Array<string | T>>) => Promise<void>
}

/**
 * Create an instance of methods to manipulate data from Firestore.
 * @param path Path to collection.
 */
export const useFirestore = <T>(path: MaybeRef<string>): UseFirestoreReturnType<T> => ({
  get: <any>get.bind(undefined, path),
  save: createUnrefFn(save).bind(undefined, path),
  erase: createUnrefFn(erase).bind(undefined, path),
})

/**
 * Create a shared instance of methods to manipulate data from Firestore.
 * @param path Path to collection.
 */
export const createSharedFirestore = <T extends DocumentData>(path: string) =>
  createSharedComposable(() => useFirestore<T>(path))
