/* eslint-disable unicorn/consistent-function-scoping */
import { noop } from '@hsjm/shared'
import { Ref, ref, unref, watch } from 'vue-demi'
import { MaybeRef, isClient, tryOnScopeDispose, until } from '@vueuse/shared'
import { DocumentData, FirestoreError, SetOptions, SnapshotListenOptions, getDoc, getDocs, onSnapshot } from 'firebase/firestore'
import { EraseOptions, QueryFilter, createQuery, erase, getSnapshotData, isDocumentReference, save } from './utils'

export interface UseFirestoreOptions<T = any> extends SnapshotListenOptions {
  /** Sync the data using `onSnapshot` method. */
  sync?: boolean
  /** Prevent `onSnapshot` unsubscription and cache deletion on scope dispose. */
  keepAlive?: boolean
  /** If true, the data will have to be fetched manually. */
  manual?: boolean
  /** Initial value. */
  initialValue?: T
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
  <T = DocumentData>(path: MaybeRef<string>, filter?: QueryFilter<T>, options?: UseFirestoreOptions<T> & { pickFirst: true }): UseFirestoreReturnType<T>
  <T = DocumentData>(path: MaybeRef<string>, filter?: QueryFilter<T>, options?: UseFirestoreOptions<T[]>): UseFirestoreReturnType<T[]>
  <T = DocumentData>(path: MaybeRef<string>, filter?: MaybeRef<string | undefined>, options?: UseFirestoreOptions<T>): UseFirestoreReturnType<T>
}

/**
 * Fetch data from firestore and bind it to a `Ref`
 * @param path Path to the collection
 * @param filter ID or filter parameters.
 * @param options Custom parameters of the method.
 */
export const useFirestore: UseFirestore = (path: any, filter: any, options: any = {}): any => {
  // --- Destructure options.
  const { initialValue, onError, sync, keepAlive, pickFirst, manual } = options

  // --- Init variables.
  let unsubscribe = noop
  const data = ref(initialValue)
  const loading = ref(false)
  const update = sync && isClient

    // --- Get on snapshot.
    ? async() => {
      loading.value = true
      const query = createQuery(unref(path), unref(filter))
      unsubscribe()
      unsubscribe = onSnapshot<any>(<any>query, options, {
        next: (snapshot) => { data.value = snapshot ? getSnapshotData(snapshot, pickFirst) : initialValue },
        complete: () => { loading.value = false },
        error: onError,
      })
      await until(loading).toBe(false)
    }

    // --- Get once.
    : async() => {
      loading.value = true
      const query = createQuery(unref(path), unref(filter))
      const snapshotPromise = isDocumentReference(query) ? getDoc(query) : getDocs(query)
      const snapshot = await snapshotPromise.catch(onError)
      data.value = snapshot ? getSnapshotData(snapshot, pickFirst) : initialValue
      loading.value = false
    }

  // --- Start `filter` watcher.
  if (!manual) watch([path, filter], update, { immediate: true })
  if (!keepAlive) tryOnScopeDispose(unsubscribe)

  // --- Return readonly data ref.
  return {
    data,
    loading,
    update,
    save: (options: SetOptions) => save(unref(path), unref(data), options),
    erase: (options: EraseOptions) => erase(unref(path), unref(data), options),
  }
}
