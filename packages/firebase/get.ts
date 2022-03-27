import { Ref, isRef, ref, unref, watch } from 'vue-demi'
import { MaybeRef, extendRef, isClient, reactify, tryOnScopeDispose } from '@vueuse/core'
import { DocumentData, FirestoreError, Unsubscribe, getDoc, getDocs, onSnapshot } from 'firebase/firestore'
import { resolvable } from '@hsjm/core'
import { QueryFilter, createQuery } from './createQuery'
import { isDocumentReference, unpeelSnapshot } from './utils'

export interface GetOptions {
  /** Error handler. */
  onError?: (error: FirestoreError) => void
  /** Sync the data using `onSnapshot` method. */
  onSnapshot?: boolean
  /** Prevent `onSnapshot` unsubscription and cache deletion on scope dispose. */
  keepAlive?: boolean
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export interface RefFirebase<T extends DocumentData | DocumentData[]> extends Ref<T> {
  ready: Promise<void>
  loading: boolean
  update: () => void
}

// --- Cache register.
export const _cache: Record<string, any> = {}

// --- Overloads.
interface Get {
  <T extends DocumentData>(path: MaybeRef<string>, filter: MaybeRef<string>, initialValue?: MaybeRef<T>, optidons?: GetOptions): RefFirebase<T>
  <T extends DocumentData>(path: MaybeRef<string>, filter: MaybeRef<QueryFilter>, initialValue?: MaybeRef<T[]>, options?: GetOptions): RefFirebase<T[]>
  <T extends DocumentData>(path: MaybeRef<string>, filter: MaybeRef<string | QueryFilter>, initialValue?: MaybeRef<T | T[]>, options?: GetOptions): RefFirebase<T | T[]>
}

/**
 * Fetch data from firestore and bind it to a `Ref`
 * @param path Path to the collection
 * @param filter ID or filter parameters.
 * @param initialValue Initial value of the returned `Ref`.
 * @param options Custom parameters of the method.
 */
export const get: Get = (path: MaybeRef<string>, filter: MaybeRef<string | QueryFilter>, initialValue?: MaybeRef<DocumentData | DocumentData[]>, options = {} as GetOptions) => {
  // --- Caching.
  const cacheId = `${!!options.onSnapshot}:${path}:${JSON.stringify(filter)}`
  if (cacheId in _cache) return _cache[cacheId]

  // --- Init local variables.
  let update: () => void
  const { promise, resolve, pending, reset } = resolvable<void>()
  const query = reactify(createQuery)(path, filter)

  // --- Init `data` ref.
  if (!initialValue) initialValue = typeof unref(filter) === 'string' ? {} : []
  const data: any = isRef(initialValue) ? initialValue : ref(initialValue)

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
        (snapshot: any) => { data.value = unpeelSnapshot(snapshot); resolve() },
        options.onError,
      )
    }

    // --- Unsubscribe and clear cache on scope dispose.
    if (options.keepAlive) {
      tryOnScopeDispose(() => {
        if (unsubscribe) unsubscribe()
        if (_cache[cacheId]) delete _cache[cacheId]
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
        ? getDoc(query.value as any).then(unpeelSnapshot)
        : getDocs(query.value).then(unpeelSnapshot)

      // --- Set date on resolve.
      getPromise.then((_data) => { data.value = _data; resolve() })
    }
  }

  // --- Start `filter` watcher.
  watch(query, update, { immediate: true })

  // --- Return readonly data ref.
  extendRef(data, { ready: promise, loading: pending, update })
  return (_cache[cacheId] = data)
}