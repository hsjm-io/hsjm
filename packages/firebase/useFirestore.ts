/* eslint-disable unicorn/prevent-abbreviations */
import { DocumentData } from 'firebase/firestore'
import { MaybeRef, createSharedComposable } from '@vueuse/shared'
import { createUnrefFn } from '@vueuse/core'
import { Get, get } from './get'
import { Erase, erase } from './erase'
import { Save, save } from './save'

/**
 * Create an instance of methods to manipulate data from Firestore.
 * @param path Path to collection.
 */
export const useFirestore = <T>(path: MaybeRef<string>) => ({
  /**
   * Fetch data from collection and bind it to a `Ref`
   * @param filter ID or filter parameters.
   * @param initialValue Initial value of the returned `Ref`.
   * @param options Custom parameters of the method.
   */
  get: (get as Get<T>).bind(undefined, path),
  /**
   * Save document(s) to collection.
   * @param data Document(s) and/or ID(s) to save.
   */
  save: createUnrefFn(save as Save<T>).bind(undefined, path),
  /**
   * Erase document(s) from collection.
   * @param data Document(s) and/or ID(s) to erase.
   */
  erase: createUnrefFn(erase as Erase<T>).bind(undefined, path),
})

/**
 * Create a shared instance of methods to manipulate data from Firestore.
 * @param path Path to collection.
 */
export const createSharedFirestore = <T extends DocumentData>(path: string) =>
  createSharedComposable(() => useFirestore<T>(path))
