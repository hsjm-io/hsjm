import { asyncComputed } from '@vueuse/core'
import { ref, watch, Ref, unref, readonly, WatchStopHandle } from 'vue-demi'
import { tryOnScopeDispose, MaybeRef, extendRef, isClient } from '@vueuse/shared'
import { DocumentData, FirestoreError, Unsubscribe } from 'firebase/firestore'
import { get, sync, erase, save, QueryFilter } from './utils'
import { defaults, partial } from 'lodash'

interface UseFirestoreOptions {
  /** Generic error handler. */
  onError?: (error: FirestoreError) => void,
}

const defaultOptions: UseFirestoreOptions = {
  onError: (error: FirestoreError) => { console.log(error.message) },
}

/**
 * Wrap a Firestore query or reference and supply reactive `data` and methods.
 * If the `initialValue` option is a `Ref` and `autoFetch` options is `true`,
 * the `get` method will be called on each changes, subsequently restarting `onSnapshot` on the new query.
 * @param query Reference or query to use to get the data. 
 * @param options Options to use.
 */
 export const useFirestore = <T extends DocumentData>(path: string, options = {} as UseFirestoreOptions) => {

  // --- Destructure and defaults options.
  const { onError } = defaults(options, defaultOptions)

  // --- Cache register.
  const cache: Record<string, any> = {}

  function _get(filter: MaybeRef<string>, initialValue?: T, _options?: UseFirestoreOptions): Readonly<Ref<T>> & { ready: Promise<void> }
  function _get(filter: MaybeRef<QueryFilter>, initialValue?: T[], _options?: UseFirestoreOptions): Readonly<Ref<T[]>> & { ready: Promise<void> }
  function _get(filter: MaybeRef<string | QueryFilter>, initialValue?: any, _options?: UseFirestoreOptions) {

    // --- Caching.
    const cacheId = 'get:' + JSON.stringify(filter)
    if(cacheId in cache) cache[cacheId]

    // --- Promise.
    let readyResolve: (value?: unknown) => void
    let ready = new Promise(resolve => readyResolve = resolve)

    // --- Fetching.
    const update = async () => {
      const _data = await get<T>(path, unref(filter))
      readyResolve()
      return _data
    }

    // --- Init `data` computed.
    if(!initialValue) initialValue = typeof unref(filter) === 'string' ? {} : []
    const data = asyncComputed(update, initialValue, { onError: onError as any })
    extendRef(data, { ready })

    // --- Return readonly data ref.
    return (cache[cacheId] = readonly(data))
  }

  function _sync(filter: MaybeRef<string>, initialValue?: T, _options?: UseFirestoreOptions): Readonly<Ref<T>> & { ready: Promise<void> }
  function _sync(filter: MaybeRef<QueryFilter>, initialValue?:T[], _options?: UseFirestoreOptions): Readonly<Ref<T[]>> & { ready: Promise<void> }
  function _sync(filter: MaybeRef<string | QueryFilter>, initialValue?: any, _options?: UseFirestoreOptions) {

    // --- Caching.
    const cacheId = 'sync:' + JSON.stringify(filter)
    if(cacheId in cache) cache[cacheId]

    // --- Promise.
    let readyResolve: (value?: unknown) => void
    let ready = new Promise(resolve => readyResolve = resolve)

    // --- Init `data` ref.
    if(!initialValue) initialValue = typeof unref(filter) === 'string' ? {} : []
    const data = ref(initialValue)
    extendRef(data, { ready })

    // --- Init local variables.
    let stopSync: Unsubscribe
    let stopWatch: WatchStopHandle

    // --- Unregister watcher and init a new one.
    const update = () => {
      stopSync && stopSync()
      stopSync = sync(data, path, unref(filter), { onError, onNext: readyResolve })
    }

    // --- Start `filter` watcher.
    stopWatch = watch(() => filter, update, { deep: true, immediate: true })

    // --- stopSync from `onSnapshot`, watcher and remove from cache.
    tryOnScopeDispose(() => {
      stopSync && stopSync()
      stopWatch && stopWatch()
      cache[cacheId] && delete cache[cacheId]
    })

    // --- Return readonly data ref.
    return (cache[cacheId] = readonly(data))
  }

  //--- Return data and methods.
  return {
    get: _get,
    sync: isClient ? _sync : _get,
    save: partial(save, path),
    erase: partial(erase, path),
  }
}
