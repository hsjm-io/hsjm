/* eslint-disable unicorn/consistent-function-scoping */
import { FirestoreError, SnapshotListenOptions, getDoc, getDocs, onSnapshot } from 'firebase/firestore'
import { Ref, isReactive, isRef, onScopeDispose, ref, unref, watch } from 'vue-demi'
import { MaybeRef, ready } from '@hsjm/core'
import { isNode } from '@hsjm/shared'
import { FirestoreEraseOptions, QueryFilter, SaveOptions, firestoreCreateQuery, firestoreErase, firestoreSnapshotData, isDocumentReference, firestoreSave } from '../utils'

export interface UseFirestoreOptions<T = any> extends
  SaveOptions,
  FirestoreEraseOptions,
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
    const unrefOptions = unref(options)
    const query: any = firestoreCreateQuery(unrefPath, unrefFilter)
    const { sync, pickFirst, onError } = unrefOptions

    // --- Initialize onSnapshot watcher.
    loading.value = true

    if (sync && !isNode) {
      unsubscribe = onSnapshot(query, unrefOptions, {
        next: (snapshot) => {
          const snapshotData = firestoreSnapshotData(snapshot, pickFirst)
          if (snapshotData !== undefined) data.value = snapshotData
        },
        complete: () => { loading.value = false },
        error: onError,
      })
    }

    // --- Fetch data once.
    else {
      const snapshotPromise = isDocumentReference(query) ? getDoc(query) : getDocs(query)
      const snapshot: any = await snapshotPromise
      const snapshotData = firestoreSnapshotData(snapshot, pickFirst)
      if (snapshotData !== undefined) data.value = snapshotData
      loading.value = false
    }

    // --- Await until the data is loaded.
    await ready(loading)
    return data.value
  }

  // --- Start `filter` watcher.
  const manual = unref(options).manual
  const toWatch = [path, filter, options].filter(x => isReactive(x) || isRef(x))
  if (!manual && toWatch.length > 0) unwatch = watch(toWatch, () => update().catch(unref(options).onError))

  // --- Stop the watchers/listeners on scope dispose.
  onScopeDispose(() => {
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
    save: (_options: SaveOptions) => firestoreSave(unref(path), unref(data), { ...unref(options), ..._options }).catch(unref(options).onError),
    erase: (_options: FirestoreEraseOptions) => firestoreErase(unref(path), unref(data), { ...unref(options), ..._options }).catch(unref(options).onError),
  } as any
}
