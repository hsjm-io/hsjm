import { createUnrefFn } from '@vueuse/core';
import { ref, watch, isReactive, Ref } from 'vue-demi'
import { tryOnScopeDispose, tryOnMounted, toReactive } from '@vueuse/shared'
import { where, DocumentData, FirestoreError } from 'firebase/firestore'
import { get, sync, remove, save } from './utils'
import { isArray, partial, partialRight } from 'lodash'

/** Firebase `where` method arguments */
type Filter = [
  Parameters<typeof where>[0],
  Parameters<typeof where>[1],
  Parameters<typeof where>[2],
]

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
  filter?: Filter[] | Filter | string | undefined,
  options = {} as UseFirestoreOptions
) => {

  //--- Destructure and defaults options.
  const {
    manual = false,
    autoSave = false,
    onError = console.error
  } = options

  //--- Init variables.
  const data = ref(isArray(filter) ? [] : {}) as Ref<T | T[]>
  const loading = ref(false)

  // --- Init stop functions.
  let stopWatch: Function | undefined
  let stopAutoSave: Function | undefined
  let stopOnSnapshot: Function | undefined

  // --- Init lifecycles.
  if (!manual) {
    tryOnMounted(() => {

      // --- Reactive get/subscribe/unsubscribe.
      if(isReactive(filter)) {
        stopWatch = watch(
          () => filter, 
          filter => {
            loading.value = true
            get<T>(path, filter)
              .then(x => data.value = x)
              .catch(onError)
            loading.value = false
            stopOnSnapshot && stopOnSnapshot()
            stopOnSnapshot = sync(data, path, filter, onError)
          },
          { immediate: true, deep: true })
      }

      // --- One-time get/subscribe.
      else {
        loading.value = true
        get<T>(path, filter)
          .then(x => data.value = x)
          .catch(onError)
        stopOnSnapshot = sync(data, path, filter, onError)
        loading.value = false
      }
    })

    // --- Init auto-save.
    if(autoSave)
      stopAutoSave = watch(data, data => save(path, data).catch(onError))

    //--- Stop listener and watcher on scope dispose.
    tryOnScopeDispose(() => {
      stopWatch && stopWatch()
      stopAutoSave && stopAutoSave()
      stopOnSnapshot && stopOnSnapshot()
    })
  }

  //--- Return data and methods.
  return {
    data: toReactive(data) as (typeof filter extends Filter[] | Filter | undefined ? T[] : T),
    loading,
    get: createUnrefFn(partial(get, path)),
    sync: createUnrefFn(partialRight(partial(sync, data, path), onError)),
    save: createUnrefFn(partial(save, path)),
    remove: createUnrefFn(partial(remove, path)),
  }
}
