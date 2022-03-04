import { asyncComputed } from '@vueuse/core';
import { ref, watch, Ref, unref } from 'vue-demi'
import { tryOnScopeDispose, tryOnMounted, MaybeRef } from '@vueuse/shared'
import { where, DocumentData, FirestoreError } from 'firebase/firestore'
import { get, sync, erase, save } from './utils'
import { partial } from 'lodash'

interface UseFirestoreOptions {
  /** Generic error handler. */
  onError?: (error: FirestoreError) => void
}

/**
 * Wrap a Firestore query or reference and supply reactive `data` and methods.
 * If the `initialValue` option is a `Ref` and `autoFetch` options is `true`,
 * the `get` method will be called on each changes, subsequently restarting `onSnapshot` on the new query.
 * @param query Reference or query to use to get the data. 
 * @param options Options to use.
 */
 export const useFirestore = <T extends DocumentData>(
  path: string,
  options = {} as UseFirestoreOptions
) => {

  //--- Destructure and defaults options.
  const { onError = console.error } = options

  const getCached: Record<string, Ref<any>> = {}
  const syncCached: Record<string, Ref<any>> = {}

  function _get(filter: MaybeRef<any[]>, initialValue?: T[]): Ref<T[]>
  function _get(filter: MaybeRef<string>, initialValue?: T): Ref<T>
  function _get(filter: MaybeRef<string | any[]>, initialValue?: any) {
    const getId = filter.toString()
    if(syncCached[getId]) return syncCached[getId]
    if(getCached[getId]) return getCached[getId]
    const data = asyncComputed(() => get<T>(path, unref(filter)), initialValue)
    getCached[getId] = data
    return data
  }

  function _sync(filter: MaybeRef<any[]>, initialValue?: T[]): Ref<T[]>
  function _sync(filter: MaybeRef<string>, initialValue?: T): Ref<T>
  function _sync(filter: MaybeRef<string | any[]>, initialValue?: any) {

    const syncId = filter.toString()
    if(syncCached[syncId]) return syncCached[syncId]

    if(!initialValue) initialValue = typeof unref(filter) === 'string' ? {} : []
    const data = ref(initialValue)
    let stopWatch: Function | undefined
    let stopOnSnapshot: Function | undefined

    const update = () => {
      // data.value = await get(data, unref(filter))
      stopOnSnapshot && stopOnSnapshot()
      stopOnSnapshot = sync(data, path, unref(filter), onError)
    }

    tryOnMounted(update)
    stopWatch = watch(() => filter, update, { deep: true })

    tryOnScopeDispose(() => {
      stopWatch && stopWatch()
      stopOnSnapshot && stopOnSnapshot()
      delete syncCached[syncId]
    })

    syncCached[syncId] = data
    return data
  }

  //--- Return data and methods.
  return {
    get: _get,
    sync: _sync,
    save: partial(save, path),
    erase: partial(erase, path),
  }
}
