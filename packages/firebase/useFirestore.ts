/* eslint-disable unicorn/prevent-abbreviations */
import { partial } from 'lodash'
import { DocumentData } from 'firebase/firestore'
import { MaybeRef, createSharedComposable, createUnrefFn } from '@vueuse/core'
import { GetOptions, RefFirestore, get } from './get'
import { erase } from './erase'
import { save } from './save'
import { QueryFilter } from './createQuery'

/**
 * Create an instance of methods to manipulate data from Firestore.
 * @param path Path to collection.
 */
export const useFirestore = <T extends DocumentData>(path: MaybeRef<string>) => ({
  /**
   * Fetch data from collection and bind it to a `Ref`
   * @param filter ID or filter parameters.
   * @param initialValue Initial value of the returned `Ref`.
   * @param options Custom parameters of the method.
   */
  get: partial(get, path) as {
    (filter: MaybeRef<string>, initialValue?: MaybeRef<T>, options?: GetOptions): RefFirestore<T>
    (filter: MaybeRef<QueryFilter>, initialValue?: MaybeRef<T[]>, options?: GetOptions): RefFirestore<T[]>
  },
  /**
   * Save document(s) to collection.
   * @param data Document(s) and/or ID(s) to save.
   */
  save: partial(createUnrefFn(save), path) as (data: MaybeRef<T | T[]>) => Promise<void>,
  /**
   * Erase document(s) from collection.
   * @param data Document(s) and/or ID(s) to erase.
   */
  erase: partial(createUnrefFn(erase), path) as (data: MaybeRef<string | T | (string | T)[]>) => Promise<void>,
})

/**
 * Create a shared instance of methods to manipulate data from Firestore.
 * @param path Path to collection.
 */
export const createSharedFirestore = <T extends DocumentData>(path: string) =>
  createSharedComposable(() => useFirestore<T>(path))
