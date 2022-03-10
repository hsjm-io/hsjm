import { Ref } from 'vue-demi'
import { forEach, isArray, isFunction, isObjectLike, isString } from 'lodash'
import {
  collection, getFirestore, where, doc, query, orderBy, limit,
  getDoc, getDocs, onSnapshot, setDoc, writeBatch, deleteDoc,
  DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot,
  DocumentData, DocumentReference, CollectionReference, Query,
  FirestoreError, Unsubscribe, QueryConstraint, startAt, startAfter, endAt, endBefore, SnapshotListenOptions
} from 'firebase/firestore'

function unpeelSnapshot<T extends DocumentData>(snapshot: QuerySnapshot<T>): T[]
function unpeelSnapshot<T extends DocumentData>(snapshot: DocumentSnapshot<T> | QueryDocumentSnapshot<T>): T
function unpeelSnapshot<T extends DocumentData>(snapshot: DocumentSnapshot<T> | QuerySnapshot<T> | QueryDocumentSnapshot<T>): T | T[] {

  const isDocumentSnapshot = (snapshot: any): snapshot is DocumentSnapshot =>
    snapshot && isString(snapshot.id) && isFunction(snapshot.data)

  if(isDocumentSnapshot(snapshot)) 
    return { id: snapshot.id, ...snapshot.data() } as unknown as T

  else {
    const data: T[] = []
    snapshot.forEach(x => data.push({ id: x.id, ...x.data() }))
    return data
  }
}

interface QueryConstraintObject {
  $limit?: number,
  $startAt?: number
  $startAfter?: number
  $endAt?: number
  $endBefore?: number
  $orderBy?: string | string[]
  [x: string]: any
}

export type QueryFilter = QueryConstraintObject | QueryConstraint[] | string

export function createQuery<T extends DocumentData>(path: string, filter: string): DocumentReference<T>
export function createQuery<T extends DocumentData>(path: string, filter: QueryConstraintObject | QueryConstraint[]): Query<T> | CollectionReference<T>
export function createQuery<T extends DocumentData>(path: string, filter: QueryFilter) {
  if(!filter) throw Error('Cannot resolve Firestore reference: Invalid `filter` argument.')

  // --- Initialize variables.
  const constraints: QueryConstraint[] = []
  const colRef = collection(getFirestore(), path) as CollectionReference<T>

  // --- Return a single document's reference.
  if(isString(filter)) return doc(colRef, filter)

  // --- Use premade constraints.
  else if(isArray(filter)) return constraints.concat(filter)

  // --- Generate constraints from object.
  else if(isObjectLike(filter)) {
    forEach(filter, (value, key) => {
      if(key === '$limit') constraints.push(limit(value))
      else if(key === '$startAt') constraints.push(startAt(value))
      else if(key === '$startAfter') constraints.push(startAfter(value))
      else if(key === '$endAt') constraints.push(endAt(value))
      else if(key === '$endBefore') constraints.push(endBefore(value)) // @ts-ignore
      else if(key === '$orderBy') isString(value) ? constraints.push(orderBy(value)) : constraints.push(orderBy(...value))
      else if(key.endsWith('_lt')) constraints.push(where(key.replace('_lt',''), '<', value))
      else if(key.endsWith('_lte')) constraints.push(where(key.replace('_lte',''), '<=', value))
      else if(key.endsWith('_ne')) constraints.push(where(key.replace('_ne',''), '!=', value))
      else if(key.endsWith('_gt')) constraints.push(where(key.replace('_gt',''), '>', value))
      else if(key.endsWith('_gte')) constraints.push(where(key.replace('_gte',''), '>=', value))
      else if(key.endsWith('_in')) constraints.push(where(key.replace('_in',''), 'in', value))
      else if(key.endsWith('_nin')) constraints.push(where(key.replace('_nin',''), 'not-in', value))
      else if(key.endsWith('_ac')) constraints.push(where(key.replace('_ac',''), 'array-contains', value))
      else if(key.endsWith('_aca')) constraints.push(where(key.replace('_aca',''), 'array-contains-any', value))
      else constraints.push(where(key, '==', value))
    })
  }

  // --- Return query.
  return constraints ? query(colRef, ...constraints) : colRef
}

export function get<T extends DocumentData>(path: string, filter: string): Promise<T>
export function get<T extends DocumentData>(path: string, filter: QueryConstraintObject | QueryConstraint[]): Promise<T[]>
export function get<T extends DocumentData>(path: string, filter: QueryFilter): Promise<T | T[]>
export function get(path: string, filter: QueryFilter) {
  return typeof filter === 'string'
    ? getDoc(createQuery(path, filter)).then(unpeelSnapshot)
    : getDocs(createQuery(path, filter)).then(unpeelSnapshot)
}

interface SyncOptions extends SnapshotListenOptions {
  onNext?: Parameters<typeof onSnapshot>[2] | (() => void),
  onError?: Parameters<typeof onSnapshot>[3] | (() => void),
  onCompletion?: Parameters<typeof onSnapshot>[4],
} 

export function sync<T extends DocumentData>(data: Ref<T>, path: string, filter: string, options?: SyncOptions): Unsubscribe
export function sync<T extends DocumentData>(data: Ref<T[]>, path: string, filter: QueryConstraintObject | QueryConstraint[], options?: SyncOptions): Unsubscribe
export function sync<T extends DocumentData>(data: Ref<T | T[]>, path: string, filter: QueryFilter, options?: SyncOptions): Unsubscribe
export function sync(
  data: Ref<any>,
  path: string,
  filter: QueryFilter,
  options = {} as SyncOptions
) {
  return onSnapshot(
    createQuery(path, filter as any),
    (snapshot: any) => {
      data.value = unpeelSnapshot(snapshot)
      if(options.onNext) return options.onNext(snapshot)
    },
    options.onError,
    options.onCompletion,
  )
}

export function erase<T extends DocumentData>(path: string, data: T | T[] | string | string[]): Promise<void>
export function erase(path: string, data: any) {
  const colRef = collection(getFirestore(), path)
  if(isArray(data)) {
    const batch = writeBatch(getFirestore())
    for(const x of data) batch.delete(doc(colRef, x.id ?? x))
    return batch.commit()
  }
  else return deleteDoc(doc(colRef, data.id ?? data))
}

export function save<T extends DocumentData>(path: string, data: T | T[]): Promise<void>
export function save(path: string, data: any) {
  const colRef = collection(getFirestore(), path)
  if(isArray(data)) {
    const batch = writeBatch(getFirestore())
    for(const x of data) batch.set(doc(colRef, x.id), x)
    return batch.commit()
  }
  else return setDoc(doc(colRef, data.id), data)
}
