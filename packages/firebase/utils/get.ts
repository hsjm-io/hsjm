import { noop } from '@hsjm/shared'
import { createUnrefFn } from '@vueuse/core'
import { Ref, ref, toRefs } from 'vue-demi'
import { MaybeRef, isClient, reactify, tryOnScopeDispose, whenever } from '@vueuse/shared'
import { DocumentData, DocumentReference, FirestoreDataConverter, FirestoreError, Query, SnapshotListenOptions, getDoc, getDocs, onSnapshot } from 'firebase/firestore'
import { noopAsync } from './../../shared/misc/noop'
import { QueryFilter, createQuery } from './createQuery'
import { getSnapshotData, isDocumentReference } from './getSnapshotData'
import { save } from './save'
import { erase } from './erase'

export interface GetOptions<T = DocumentData> extends SnapshotListenOptions {
  /** Error handler. */
  onError?: (error: FirestoreError) => void
  /** Sync the data using `onSnapshot` method. */
  sync?: boolean
  /** Prevent `onSnapshot` unsubscription and cache deletion on scope dispose. */
  keepAlive?: boolean
  /** Debug. */
  debug?: boolean
  /** Initial value. */
  initialValue?: any
  /** Pick the first item of the result if it's an array of documents. */
  pickFirst?: any
  /** Pick the first item of the result if it's an array of documents. */
  converter?: FirestoreDataConverter<T>
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export interface GetReturnType<T = DocumentData> {
  data: Ref<T>
  query: Query | DocumentReference
  loading: Ref<boolean>
  update: () => void
  save: () => Promise<void>
  erase: () => Promise<void>
}

// --- Overloads.
export interface Get<T = DocumentData> {
  <U extends T>(path: MaybeRef<string>, filter?: QueryFilter, options?: GetOptions<T> & { pickFirst: true }): GetReturnType<U>
  <U extends T>(path: MaybeRef<string>, filter?: QueryFilter, options?: GetOptions<T>): GetReturnType<U[]>
  <U extends T>(path: MaybeRef<string>, filter?: MaybeRef<string | undefined>, options?: GetOptions<T>): GetReturnType<U>
}

/**
 * Fetch data from firestore and bind it to a `Ref`
 * @param path Path to the collection
 * @param filter ID or filter parameters.
 * @param options Custom parameters of the method.
 */
export const get: Get = (path, filter, options = {}): any => {
  // --- Destructure options.
  const { initialValue, onError, sync, keepAlive, pickFirst, converter } = toRefs(options)

  // --- Init variables.
  let update = noopAsync
  let unsubscribe = noop
  const data = ref(initialValue)
  const loading = ref(false)
  const query = reactify(createQuery)(path, filter, converter) as Ref<any>

  // --- Daclare `onNext` callback.
  const onNext = (snapshot: any) =>
    data.value = getSnapshotData(snapshot, pickFirst?.value) ?? initialValue?.value

  // --- Get on snapshot.
  if (sync && isClient) {
    update = async() => {
      loading.value = true
      unsubscribe()
      unsubscribe = onSnapshot(query.value as any, options, {
        next: onNext,
        error: onError?.value,
      })
    }

    // --- Unsubscribe and clear cache on scope dispose.
    if (!keepAlive) tryOnScopeDispose(unsubscribe)
  }

  // --- Get once.s
  else {
    update = async() => {
      loading.value = true
      isDocumentReference(query.value)
        ? await getDoc(query.value).then(onNext)
        : await getDocs(query.value).then(onNext)
    }
  }

  // --- Start `filter` watcher.
  whenever(query, update, { immediate: true })

  // --- Return readonly data ref.
  return {
    data,
    query,
    loading,
    update,
    save: createUnrefFn(save).bind(undefined, path, data),
    erase: createUnrefFn(erase).bind(undefined, path, data),
  }
}
