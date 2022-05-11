import { Ref, isRef, ref } from 'vue-demi'
import { createUnrefFn } from '@vueuse/core'
import { MaybeRef, extendRef, isClient, reactify, tryOnScopeDispose, whenever } from '@vueuse/shared'
import { DocumentData, FirestoreError, Unsubscribe, getDoc, getDocs, onSnapshot } from 'firebase/firestore'
import { resolvable } from '@hsjm/shared'
import { QueryFilter, createQuery } from './createQuery'
import { isDocumentReference, unpeelSnapshot } from './utils'
import { save } from './save'
import { erase } from './erase'

export interface GetOptions {
  /** Error handler. */
  onError?: (error: FirestoreError) => void
  /** Sync the data using `onSnapshot` method. */
  sync?: boolean
  /** Prevent `onSnapshot` unsubscription and cache deletion on scope dispose. */
  keepAlive?: boolean
  /** Debug. */
  debug?: boolean
  /** Take the first document of a returned array. */
  pickFirst: true
  /** Initial value. */
  initialValue?: any
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export interface RefFirestore<T = DocumentData | DocumentData[]> extends Ref<T> {
  ready: Promise<void>
  loading: boolean
  refresh: () => void
  save: () => Promise<void>
  erase: () => Promise<void>
}

// --- Overloads.
export interface Get<_T = DocumentData> {
  <T extends _T>(path: MaybeRef<string>, filter?: MaybeRef<QueryFilter>, options?: GetOptions & { pickFirst: true }): RefFirestore<T>
  <T extends _T>(path: MaybeRef<string>, filter?: MaybeRef<QueryFilter>, options?: GetOptions & { pickFirst: false | undefined }): RefFirestore<T[]>
  <T extends _T>(path: MaybeRef<string>, filter?: MaybeRef<string | null>, options?: GetOptions): RefFirestore<T>
  <T extends _T>(path: MaybeRef<string>, filter?: MaybeRef<string | null | QueryFilter>, options?: GetOptions & { pickFirst: true }): RefFirestore<T>
  <T extends _T>(path: MaybeRef<string>, filter?: MaybeRef<string | null | QueryFilter>, options?: GetOptions & { pickFirst: false | undefined }): RefFirestore<T | T[]>
}

/**
 * Fetch data from firestore and bind it to a `Ref`
 * @param path Path to the collection
 * @param filter ID or filter parameters.
 * @param initialValue Initial value of the returned `Ref`.
 * @param options Custom parameters of the method.
 */
export const get: Get = (path, filter, options = {} as GetOptions) => {
  // --- Destructure options.
  const { initialValue, onError, sync, keepAlive } = options

  // --- Init local variables.
  let update: () => void
  const { promise, resolve, pending, reset } = resolvable<void>()
  const query = reactify(createQuery)(path, filter)
  const data: Ref<any> = isRef(initialValue) ? initialValue : ref(initialValue)

  // --- Get on snapshot.
  if (sync && isClient) {
    let unsubscribe: Unsubscribe
    update = () => {
      // --- Reset promise & unsubscribe if possible.
      reset()
      unsubscribe && unsubscribe()

      // --- Subscribe to data.
      unsubscribe = onSnapshot(
        <any>query.value,
        (snapshot) => {
          data.value = unpeelSnapshot(snapshot, options)
          resolve()
        },
        onError,
      )
    }

    // --- Unsubscribe and clear cache on scope dispose.
    if (keepAlive)
      tryOnScopeDispose(() => unsubscribe && unsubscribe())
  }

  // --- Get once.
  else {
    update = () => {
      // --- Reset promise.
      reset()

      // --- Get data from firestore.
      const getPromise = isDocumentReference(query.value)
        ? getDoc(query.value)
        : getDocs(query.value)

      // --- Set date on resolve.
      getPromise.then((snapshot) => {
        data.value = unpeelSnapshot(snapshot, options)
        resolve()
      })
    }
  }

  // --- Start `filter` watcher.
  whenever(query, update, { immediate: true })

  // --- Return readonly data ref.
  return <any>extendRef(data, {
    ready: promise,
    loading: pending,
    refresh: update,
    save: () => { if (!Array.isArray(data.value)) createUnrefFn(save)(path, data) },
    erase: () => { if (!Array.isArray(data.value)) createUnrefFn(erase)(path, data) },
  })
}
