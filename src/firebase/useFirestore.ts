import { Ref, isRef, ref, unref, watch } from 'vue-demi'
import { MaybeRef, extendRef, isClient, reactify, tryOnScopeDispose } from '@vueuse/shared'
import { defaults, forEach, isArray, isObjectLike, isString, partial } from 'lodash'
import {
  CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, FirestoreError, Query,
  QueryConstraint, QuerySnapshot, Unsubscribe, collection, deleteDoc, doc, endAt,
  endBefore, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy,
  query, setDoc, startAfter, startAt, where, writeBatch,
} from 'firebase/firestore'
import { resolvable } from '~/core'

interface QueryFilter {
  $limit?: number
  $startAt?: number
  $startAfter?: number
  $endAt?: number
  $endBefore?: number
  $orderBy?: string | string[]
  [x: string]: any
}

interface UseFirestoreOptions {
  /**
   * Generic error handler.
   */
  onError?: (error: FirestoreError) => void
  /**
   * Sync the data using `onSnapshot` method.
   * @default false
   */
  onSnapshot?: boolean
}

/**
 * Check if value is of type `DocumentSnapshot`
 * @param value Value to check.
 */
const isDocumentSnapshot = (value: any): value is DocumentSnapshot => value
    && typeof value.id === 'string'
    && typeof value.exists === 'function'
    && typeof value.data === 'function'
    && typeof value.get === 'function'

/**
 * Extract data from a snapshot of any type.
 * @param snapshot Snapshot to extract from.
 */
export function unpeelSnapshot<T extends DocumentData>(snapshot: QuerySnapshot<T>): T[]
export function unpeelSnapshot<T extends DocumentData>(snapshot: DocumentSnapshot<T>): T
export function unpeelSnapshot<T extends DocumentData>(snapshot: DocumentSnapshot<T> | QuerySnapshot<T>): T | T[]
export function unpeelSnapshot(snapshot: DocumentSnapshot | QuerySnapshot) {
  return isDocumentSnapshot(snapshot)
    ? { id: snapshot.id, ...snapshot.data() }
    : snapshot.docs.map(x => ({ id: x.id, ...x.data() }))
}

/**
 * Create a `DocumentReference`, `Query` or `CollectionReference`.
 * @param path Collection path.
 * @param filter ID string or `QueryFilter`
 */
export function createQuery<T extends DocumentData>(path: string, filter: string): DocumentReference<T>
export function createQuery<T extends DocumentData>(path: string, filter: QueryFilter): Query<T> | CollectionReference<T>
export function createQuery(path: string, filter: string | QueryFilter) {
  // --- Initialize variables.
  const constraints: QueryConstraint[] = []
  const colReference = collection(getFirestore(), path)

  // --- Return a single document's reference.
  if (isString(filter)) { return doc(colReference, filter) }

  // --- Generate constraints from object.
  else if (isObjectLike(filter)) {
    forEach(filter, (value, key) => {
      switch (key) {
        case '$limit': constraints.push(limit(value)); break
        case '$startAt': constraints.push(startAt(value)); break
        case '$startAfter': constraints.push(startAfter(value)); break
        case '$endAt': constraints.push(endAt(value)); break
        case '$endBefore': constraints.push(endBefore(value)); break
        case '$orderBy': constraints.push(orderBy(value)); break
        default: if (key.endsWith('_lt')) constraints.push(where(key.replace('_lt', ''), '<', value))
        else if (key.endsWith('_lte')) constraints.push(where(key.replace('_lte', ''), '<=', value))
        else if (key.endsWith('_ne')) constraints.push(where(key.replace('_ne', ''), '!=', value))
        else if (key.endsWith('_gt')) constraints.push(where(key.replace('_gt', ''), '>', value))
        else if (key.endsWith('_gte')) constraints.push(where(key.replace('_gte', ''), '>=', value))
        else if (key.endsWith('_in')) constraints.push(where(key.replace('_in', ''), 'in', value))
        else if (key.endsWith('_nin')) constraints.push(where(key.replace('_nin', ''), 'not-in', value))
        else if (key.endsWith('_ac')) constraints.push(where(key.replace('_ac', ''), 'array-contains', value))
        else if (key.endsWith('_aca')) constraints.push(where(key.replace('_aca', ''), 'array-contains-any', value))
        else constraints.push(where(key, '==', value))
      }
    })
  }

  // --- Return query.
  return constraints ? query(colReference, ...constraints) : colReference
}

// --- Cache register.
const cache: Record<string, any> = {}

interface ReferenceFirebase<T> extends Ref<T> {
  ready: Promise<void>
  loading: boolean
  update: () => void
}

/**
 *
 * @param path
 * @param filter
 * @param initialValue
 * @param options
 */
export function get<T extends DocumentData>(path: MaybeRef<string>, filter: MaybeRef<string>, initialValue?: T, options?: UseFirestoreOptions): ReferenceFirebase<T>
export function get<T extends DocumentData>(path: MaybeRef<string>, filter: MaybeRef<QueryFilter>, initialValue?: T[], options?: UseFirestoreOptions): ReferenceFirebase<T[]>
export function get(path: MaybeRef<string>, filter: MaybeRef<any>, initialValue?: any, options = {} as UseFirestoreOptions) {
  // --- Caching.
  const cacheId = `${!!options.onSnapshot}:${path}:${JSON.stringify(filter)}`
  if (cacheId in cache) return cache[cacheId]

  // --- Init local variables.
  let update: () => void
  const { promise, resolve, pending, reset } = resolvable<void>()
  const query = reactify(createQuery)(path, filter)

  // --- Init `data` ref.
  if (!initialValue) initialValue = typeof unref(filter) === 'string' ? {} : []
  const data = isRef(initialValue) ? initialValue : ref(initialValue)

  // --- Update wraps `onSnapshot`.
  if (options.onSnapshot && isClient) {
    let unsubscribe: Unsubscribe
    update = () => {
      // --- Reset promise.
      reset()

      // --- Unsubscribe if possible.
      if (unsubscribe) unsubscribe()

      // --- Subscribe to data.
      unsubscribe = onSnapshot(
        query.value,
        (snapshot) => { data.value = unpeelSnapshot(snapshot); resolve() },
        options.onError,
      )
    }

    // --- Unsubscribe and clear cache on scope dispose.
    tryOnScopeDispose(() => {
      if (unsubscribe) unsubscribe()
      if (cache[cacheId]) delete cache[cacheId]
    })
  }

  // --- Update wraps `getDoc(s)`.
  else {
    update = () => {
      // --- Reset promise.
      reset()

      // --- Get data from firestore.
      const getPromise = typeof filter === 'string'
        ? getDoc(query.value as any).then(unpeelSnapshot)
        : getDocs(query.value).then(unpeelSnapshot)

      // --- Set date on resolve.
      getPromise.then((_data) => { data.value = _data; resolve() })
    }
  }

  // --- Start `filter` watcher.
  watch(query, update, { immediate: true })

  // --- Return readonly data ref.
  extendRef(data, { ready: promise, loading: pending, update })
  return (cache[cacheId] = data)
}

/**
 * Update or create document(s) to Firestore.
 * @param path Collection path.
 * @param data Document(s) to save.
 */
export function save<T extends DocumentData>(path: string, data: T | T[]): Promise<void>
export function save(path: string, data: any) {
  // --- Get collection reference.
  const colReference = collection(getFirestore(), path)

  // --- Save in bulk.
  if (isArray(data)) {
    const batch = writeBatch(getFirestore())
    for (const x of data) batch.set(doc(colReference, x.id), x)
    return batch.commit()
  }

  // --- Save single.
  return setDoc(doc(colReference, data.id), data)
}

/**
 * Erase document(s) from Firestore.
 * @param path Collection path.
 * @param data Document(s) to erase.
 */
export function erase<T extends DocumentData>(path: string, data: T | T[] | string | string[]): Promise<void>
export function erase(path: string, data: any) {
  // --- Get collection reference.
  const colReference = collection(getFirestore(), path)

  // --- Erase in bulk.
  if (isArray(data)) {
    const batch = writeBatch(getFirestore())
    for (const x of data) batch.delete(doc(colReference, x.id ?? x))
    return batch.commit()
  }

  // --- Erase single.
  return deleteDoc(doc(colReference, data.id ?? data))
}

/**
 * Wrap a Firestore query or reference and supply reactive `data` and methods.
 * If the `initialValue` option is a `Ref` and `autoFetch` options is `true`,
 * the `get` method will be called on each changes, subsequently restarting `onSnapshot` on the new query.
 * @param query Reference or query to use to get the data.
 * @param options Options to use.
 */
export const useFirestore = <T extends DocumentData>(path: string, options = {} as UseFirestoreOptions) => {
  // --- Defaults options.
  options = defaults(options, {
    onError: console.error,
    onSnapshot: false,
  })

  // --- Wrap `get` and defaults it's `options` parameters.
  const _get = (...arguments_: any[]) => get<T>(arguments_[0], arguments_[1], arguments_[2], defaults(options, arguments_[3]))

  // --- Return data and methods.
  return {
    get: partial(_get as typeof get, path),
    save: partial(save, path),
    erase: partial(erase, path),
  }
}
