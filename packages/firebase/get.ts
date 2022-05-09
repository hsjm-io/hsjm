import { Ref, isRef, ref, unref, watch } from 'vue-demi'
import { createUnrefFn } from '@vueuse/core'
import { MaybeRef, extendRef, isClient, reactify, tryOnScopeDispose } from '@vueuse/shared'
import { DocumentData, FirestoreError, Unsubscribe, getDoc, getDocs, onSnapshot } from 'firebase/firestore'
import { resolvable } from '@hsjm/shared'
import { QueryFilter, createQuery } from './createQuery'
import { UnpeelSnapshotOptions, isDocumentReference, unpeelSnapshot } from './utils'
import { save } from './save'
import { erase } from './erase'

export interface GetOptions extends UnpeelSnapshotOptions {
  /** Error handler. */
  onError?: (error: FirestoreError) => void
  /** Sync the data using `onSnapshot` method. */
  onSnapshot?: boolean
  /** Prevent `onSnapshot` unsubscription and cache deletion on scope dispose. */
  keepAlive?: boolean
  /** Debug. */
  debug?: boolean
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export interface RefFirestore<T = DocumentData | DocumentData[]> extends Ref<T> {
  ready: Promise<void>
  loading: boolean
  refresh: () => void
  save: () => Promise<void>
  erase: () => Promise<void>
}

// --- Cache register.
const cache: Record<string, any> = {}

// --- Overloads.
export interface Get<_T = DocumentData> {
  <T extends _T>(path: MaybeRef<string>, filter?: MaybeRef<QueryFilter>, initialValue?: MaybeRef<Partial<T>[]>, options?: GetOptions & { pickFirst: true }): RefFirestore<T>
  <T extends _T>(path: MaybeRef<string>, filter?: MaybeRef<QueryFilter>, initialValue?: MaybeRef<Partial<T>[]>, options?: GetOptions & { pickFirst: false | undefined }): RefFirestore<T[]>
  <T extends _T>(path: MaybeRef<string>, filter?: MaybeRef<string | null>, initialValue?: MaybeRef<Partial<T>>, options?: GetOptions): RefFirestore<T>
  <T extends _T>(path: MaybeRef<string>, filter?: MaybeRef<string | null | QueryFilter>, initialValue?: MaybeRef<Partial<T> | Partial<T>[]>, options?: GetOptions & { pickFirst: true }): RefFirestore<T>
  <T extends _T>(path: MaybeRef<string>, filter?: MaybeRef<string | null | QueryFilter>, initialValue?: MaybeRef<Partial<T> | Partial<T>[]>, options?: GetOptions & { pickFirst: false | undefined }): RefFirestore<T | T[]>
}

/**
 * Fetch data from firestore and bind it to a `Ref`
 * @param path Path to the collection
 * @param filter ID or filter parameters.
 * @param initialValue Initial value of the returned `Ref`.
 * @param options Custom parameters of the method.
 */
export const get: Get = (path, filter, initialValue, options = {}) => {
  // --- Caching.
  const cacheId = `${!!options.onSnapshot}:${path}:${JSON.stringify(unref(filter))}`
  if (cacheId in cache) {
    // eslint-disable-next-line no-console
    if (options.debug) console.log(`deleted cache entry ${cacheId}`)
    return cache[cacheId]
  }

  // --- Init local variables.
  let update: () => void
  const { promise, resolve, pending, reset } = resolvable<void>()
  const query = reactify(createQuery)(path, filter)
  if (!initialValue) initialValue = typeof unref(filter) === 'string' ? {} : []
  const data: Ref<any> = isRef(initialValue) ? initialValue : ref(initialValue)

  // --- Update wraps `onSnapshot`.
  if (options.onSnapshot && isClient) {
    let unsubscribe: Unsubscribe
    update = () => {
      // --- Reset promise & unsubscribe if possible.
      reset()
      if (unsubscribe) unsubscribe()

      // --- Subscribe to data.
      unsubscribe = onSnapshot(
        query.value as any,
        (snapshot: any) => { data.value = unpeelSnapshot(snapshot, options); resolve() },
        options.onError,
      )
    }

    // --- Unsubscribe and clear cache on scope dispose.
    if (options.keepAlive) {
      tryOnScopeDispose(() => {
        if (unsubscribe) unsubscribe()
        if (cache[cacheId]) delete cache[cacheId]
        // eslint-disable-next-line no-console
        if (options.debug) console.log(`deleted cache entry ${cacheId}`)
      })
    }
  }

  // --- Update wraps `getDoc(s)`.
  else {
    update = () => {
      // --- Reset promise.
      reset()

      // --- Get data from firestore.
      const getPromise = isDocumentReference(query.value)
        ? getDoc(query.value as any).then(x => unpeelSnapshot(x, options))
        : getDocs(query.value).then(x => unpeelSnapshot(x, options))

      // --- Set date on resolve.
      getPromise.then((_data) => { data.value = _data; resolve() })
    }
  }

  // --- Start `filter` watcher.
  watch(query, update, { immediate: true })

  // --- Return readonly data ref.
  return (cache[cacheId] = extendRef(data, {
    ready: promise,
    loading: pending,
    refresh: update,
    save: () => { if (!Array.isArray(data.value)) createUnrefFn(save)(path, data) },
    erase: () => { if (!Array.isArray(data.value)) createUnrefFn(erase)(path, data) },
  }))
}
