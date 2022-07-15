/* eslint-disable unicorn/consistent-function-scoping */
import { Ref, isReactive, isRef, ref, unref, watch } from 'vue-demi'
import { isBrowser } from '@hsjm/shared'
import { MaybeRef, tryOnScopeDispose, until } from '@vueuse/shared'
import { FirestoreError, SnapshotListenOptions, getDoc, getDocs, onSnapshot } from 'firebase/firestore'
import { EraseOptions, QueryFilter, SaveOptions, createQuery, erase, getSnapshotData, isDocumentReference, save } from './utils'

export interface UseFirestoreOptions<T = any> extends
  SaveOptions,
  EraseOptions,
  SnapshotListenOptions {
  /** Sync the data using `onSnapshot` method. */
  sync?: boolean
  /** Prevent `onSnapshot` unsubscription and cache deletion on scope dispose. */
  keepAlive?: boolean
  /** If true, the data will have to be fetched manually. */
  manual?: boolean
  /** Initial value. */
  initialValue?: T extends any[] ? Partial<T>[] : Partial<T>
  /** Pick the first item of the result if it's an array of documents. */
  pickFirst?: boolean
  /** Error handler. */
  onError?: (error: FirestoreError) => void
}

export interface UseFirestoreReturnType<T = any> {
  data: Ref<T>
  loading: Ref<boolean>
  update: () => Promise<void>
  save: () => Promise<T extends any[] ? string[] : string>
  erase: () => Promise<void>
}

// --- Overloads.
export interface UseFirestore {
  <T>(path: MaybeRef<string | undefined>, filter: MaybeRef<string>, options?: MaybeRef<UseFirestoreOptions<T>>): UseFirestoreReturnType<T>
  <T>(path: MaybeRef<string | undefined>, filter: MaybeRef<QueryFilter<T>>, options?: MaybeRef<UseFirestoreOptions<T>> & { pickFirst: true }): UseFirestoreReturnType<T>
  <T>(path: MaybeRef<string | undefined>, filter: MaybeRef<QueryFilter<T>>, options?: MaybeRef<UseFirestoreOptions<T[]>>): UseFirestoreReturnType<T[]>
  <T>(path: MaybeRef<string | undefined>, filter?: MaybeRef<string | QueryFilter<T> | undefined>, options?: MaybeRef<UseFirestoreOptions<T>> & { pickFirst: true }): UseFirestoreReturnType<T>
  <T>(path: MaybeRef<string | undefined>, filter?: MaybeRef<string | QueryFilter<T> | undefined>, options?: MaybeRef<UseFirestoreOptions<T | T[]>>): UseFirestoreReturnType<T | T[]>
}

/**
 * Fetch data from firestore and bind it to a `Ref`
 * @param path Path to the collection
 * @param filter ID or filter parameters.
 * @param options Custom parameters of the method.
 */
export const useFirestore: UseFirestore = (
  path: MaybeRef<string | undefined>,
  filter: MaybeRef<string | QueryFilter | undefined>,
  options: MaybeRef<UseFirestoreOptions> = {},
): UseFirestoreReturnType => {
  // --- Init variables.
  let unwatch: () => void | undefined
  let unsubscribe: () => void | undefined
  const defaultValue = typeof unref(filter) !== 'object' ? {} : []
  const data = ref<any>(unref(options).initialValue ?? defaultValue)
  const loading = ref(false)

  // --- Declare update method.
  const update = async() => {
    unsubscribe?.()
    const unrefPath = unref(path)
    const unrefFilter = unref(filter)
    if (!unrefPath) return console.warn('[useFirestore] Invalid path or filter.')
    if (!unrefFilter) return
    const query: any = createQuery(unrefPath, unrefFilter)

    const unrefOptions = unref(options)
    const { sync, pickFirst, onError } = unrefOptions

    // --- Initialize onSnapshot watcher.
    loading.value = true

    if (sync && isBrowser) {
      unsubscribe = onSnapshot(query, unrefOptions, {
        next: (snapshot) => {
          const snapshotData = getSnapshotData(snapshot, pickFirst)
          if (snapshotData !== undefined) data.value = snapshotData
        },
        complete: () => { loading.value = false },
        error: onError,
      })
    }

    // --- Fetch data once.
    else {
      const snapshotPromise = isDocumentReference(query) ? getDoc(query) : getDocs(query)
      const snapshot: any = await snapshotPromise.catch(onError)
      const snapshotData = getSnapshotData(snapshot, pickFirst)
      if (snapshotData !== undefined) data.value = snapshotData
      loading.value = false
    }

    // --- Await until the data is loaded.
    await until(loading).toBe(false)
    return data.value
  }

  // --- Start `filter` watcher.
  const manual = unref(options).manual
  const toWatch = [path, filter, options].filter(x => isReactive(x) || isRef(x))
  if (!manual && toWatch.length > 0) unwatch = watch(toWatch, update, { immediate: true })
  if (!manual) update()

  // --- Stop the watchers/listeners on scope dispose.
  tryOnScopeDispose(() => {
    if (unref(options).keepAlive) {
      unwatch?.()
      unsubscribe?.()
    }
  })

  // --- Return readonly data ref.
  return {
    data,
    loading,
    update,
    save: (_options: SaveOptions) => save(unref(path), unref(data), { ...unref(options), ..._options }).catch(unref(options).onError),
    erase: (_options: EraseOptions) => erase(unref(path), unref(data), { ...unref(options), ..._options }).catch(unref(options).onError),
  } as any
}
