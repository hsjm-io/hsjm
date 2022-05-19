import { createUnrefFn } from '@vueuse/core'
import { Ref, ref } from 'vue-demi'
import { MaybeRef, isClient, reactify, tryOnScopeDispose, whenever } from '@vueuse/shared'
import { DocumentData, DocumentReference, FirestoreError, Query, Unsubscribe, getDoc, getDocs, onSnapshot } from 'firebase/firestore'
import { resolvable } from '@hsjm/shared'
import { CreateQueryOptions, QueryFilter, createQuery } from './createQuery'
import { GetSnapshotDataOptions, getSnapshotData, isDocumentReference } from './getSnapshotData'
import { save } from './save'
import { erase } from './erase'

export interface GetOptions extends
  GetSnapshotDataOptions,
  CreateQueryOptions {
  /** Error handler. */
  onError?: (error: FirestoreError) => void
  /** Sync the data using `onSnapshot` method. */
  sync?: boolean
  /** Prevent `onSnapshot` unsubscription and cache deletion on scope dispose. */
  keepAlive?: boolean
  /** Debug. */
  debug?: boolean
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export interface GetResult<T = DocumentData> {
  data: Ref<T>
  query: Ref<Query | DocumentReference>
  ready: Promise<void>
  refresh: () => void
  save: () => Promise<void>
  erase: () => Promise<void>
}

// --- Overloads.
export interface Get<T = DocumentData> {
  <U extends T>(path: MaybeRef<string>, filter?: QueryFilter, options?: GetOptions & { pickFirst: true }): GetResult<U>
  <U extends T>(path: MaybeRef<string>, filter?: QueryFilter, options?: GetOptions): GetResult<U[]>
  <U extends T>(path: MaybeRef<string>, filter?: MaybeRef<string | null | undefined>, options?: GetOptions): GetResult<U>
}

/**
 * Fetch data from firestore and bind it to a `Ref`
 * @param path Path to the collection
 * @param filter ID or filter parameters.
 * @param options Custom parameters of the method.
 */
export const get: Get = (path, filter, options = {}): any => {
  // --- Destructure options.
  const { initialValue, onError, sync, keepAlive } = options

  let refresh: () => void
  let unsubscribe: Unsubscribe

  // --- Init local variables.
  const { promise: ready, resolve, reset } = resolvable()
  const data: any = ref(initialValue)
  const query: any = reactify<any>(createQuery)(path, filter, options)

  // --- Get on snapshot.
  if (sync && isClient) {
    refresh = () => {
      reset()
      unsubscribe && unsubscribe()
      unsubscribe = onSnapshot(
        query.value,
        (snapshot) => { data.value = getSnapshotData(snapshot, options); resolve() },
        onError,
      )
    }

    // --- Unsubscribe and clear cache on scope dispose.
    if (!keepAlive)
      tryOnScopeDispose(() => unsubscribe && unsubscribe())
  }

  // --- Get once.
  else {
    refresh = () => {
      reset()
      const getPromise = isDocumentReference(query.value)
        ? getDoc(query.value)
        : getDocs(query.value)
      getPromise.then((snapshot) => {
        data.value = getSnapshotData(snapshot, options)
        resolve()
      })
    }
  }

  // --- Start `filter` watcher.
  whenever(query, refresh, { immediate: true })

  // --- Return readonly data ref.
  return {
    data,
    query,
    ready,
    refresh,
    save: createUnrefFn(save).bind(undefined, path, data),
    erase: createUnrefFn(erase).bind(undefined, path, data),
  }
}
