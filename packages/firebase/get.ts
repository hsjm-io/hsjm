import { Ref, isRef, ref, unref, watch } from 'vue-demi'
import { MaybeRef, extendRef, isClient, reactify, tryOnScopeDispose } from '@vueuse/shared'
import { DocumentData, FirestoreError, Unsubscribe, getDoc, getDocs, onSnapshot } from 'firebase/firestore'
import { noop, resolvable } from '@hsjm/shared'
import { QueryFilter, createQuery } from './createQuery'
import { isDocumentReference, unpeelSnapshot } from './utils'
import { save } from './save'
import { erase } from './erase'

export interface GetOptions {
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
export interface RefFirestore<T extends DocumentData | DocumentData[]> extends Ref<T> {
  ready: Promise<void>
  loading: boolean
  refresh: () => void
  save: () => Promise<void>
  erase: () => Promise<void>
}

// --- Cache register.
export const _cache: Record<string, any> = {}

// --- Overloads.
interface Get {
  <T extends DocumentData>(path: MaybeRef<string>, filter: MaybeRef<string>, initialValue?: MaybeRef<T>, options?: GetOptions): RefFirestore<T>
  <T extends DocumentData>(path: MaybeRef<string>, filter: MaybeRef<QueryFilter>, initialValue?: MaybeRef<T[]>, options?: GetOptions): RefFirestore<T[]>
  <T extends DocumentData>(path: MaybeRef<string>, filter: MaybeRef<string | QueryFilter>, initialValue?: MaybeRef<T | T[]>, options?: GetOptions): RefFirestore<T | T[]>
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
  const cacheId = `${!!options.onSnapshot}:${path}:${JSON.stringify(unref(filter))}`
  if (cacheId in _cache) {
    // eslint-disable-next-line no-console
    if (options.debug) console.log(`deleted cache entry ${cacheId}`)
    return _cache[cacheId]
  }

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
        ? getDoc(query.value as any).then(unpeelSnapshot)
        : getDocs(query.value).then(unpeelSnapshot)

      // --- Set date on resolve.
      getPromise.then((_data) => { data.value = _data; resolve() })
    }
  }

  // --- Start `filter` watcher.
  watch(query, update, { immediate: true })

  // --- Return readonly data ref.
  return (_cache[cacheId] = extendRef(data, {
    ready: promise,
    loading: pending,
    refresh: update,
    save: typeof unref(filter) === 'string' ? () => save(unref(path), data) : noop,
    erase: typeof unref(filter) === 'string' ? () => erase(unref(path), data) : noop,
  }))
}
