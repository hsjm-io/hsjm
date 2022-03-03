import { asyncComputed } from '@vueuse/core';
import { ref, watch, Ref, unref } from 'vue-demi'
import { tryOnScopeDispose, tryOnMounted, MaybeRef } from '@vueuse/shared'
import { where, DocumentData, FirestoreError } from 'firebase/firestore'
import { get, sync, erase, save } from './utils'
import { partial } from 'lodash'

interface UseFirestoreOptions {
  /** Generic error handler. */
  onError?: (error: FirestoreError) => void
  /** Handles life-cycle manually. */
  manual?: boolean
  /** Handles life-cycle manually. */
  autoSave?: boolean
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

  function _get(filter: MaybeRef<any[]>, initialValue?: T[]): Ref<T[]>
  function _get(filter: MaybeRef<string>, initialValue?: T): Ref<T>
  function _get(filter: MaybeRef<string | any[]>, initialValue?: any) {
    return asyncComputed(() => get<T>(path, unref(filter)), initialValue)
  }

  function _sync(filter: MaybeRef<any[]>, initialValue?: T[]): Ref<T[]>
  function _sync(filter: MaybeRef<string>, initialValue?: T): Ref<T>
  function _sync(filter: MaybeRef<string | any[]>, initialValue?: any) {

    if(!initialValue) initialValue = typeof unref(filter) === 'string' ? {} : []
    const data = ref(initialValue)
    let stopWatch: Function | undefined
    let stopOnSnapshot: Function | undefined

    const update = () => {
      stopOnSnapshot && stopOnSnapshot()
      stopOnSnapshot = sync(data, path, unref(filter), onError)
    }
    
    tryOnMounted(update, false)
    stopWatch = watch(() => filter, update, { deep: true })

    tryOnScopeDispose(() => {
      stopWatch && stopWatch()
      stopOnSnapshot && stopOnSnapshot()
    })

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
