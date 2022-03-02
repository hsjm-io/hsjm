import { Ref } from 'vue-demi'
import { isArray } from 'lodash'
import {
  collection, getFirestore, where, doc, query,
  getDoc, getDocs, onSnapshot, setDoc, writeBatch, deleteDoc,
  DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot,
  DocumentData, DocumentReference, CollectionReference, Query,
  FirestoreError, Unsubscribe
} from 'firebase/firestore'

/** Firebase `where` method arguments */
type Filter = [
  Parameters<typeof where>[0],
  Parameters<typeof where>[1],
  Parameters<typeof where>[2],
]

function isFilter(args?: any): args is Filter {
  return !!args &&
    typeof args[0] === 'string' &&
    typeof args[1] === 'string' && 
    ["<", "<=", "==", "!=", ">=", ">", "array-contains", "in", "array-contains-any", "not-in"].includes(args[1]) &&
    args.length === 3
}

export function isDocumentSnapshot(snapshot: any): snapshot is DocumentSnapshot {
  return snapshot &&
    typeof snapshot?.id === 'string' &&
    typeof snapshot?.data === 'function'
}

function unpeelSnapshot<T extends DocumentData>(snapshot: QuerySnapshot<T>): T[]
function unpeelSnapshot<T extends DocumentData>(snapshot: DocumentSnapshot<T> | QueryDocumentSnapshot<T>): T
function unpeelSnapshot<T extends DocumentData>(snapshot: DocumentSnapshot<T> | QuerySnapshot<T> | QueryDocumentSnapshot<T>): T | T[] {
  if(isDocumentSnapshot(snapshot)) return { id: snapshot.id, ...snapshot.data() } as unknown as T
  else {
    const data: T[] = []
    snapshot.forEach(x => data.push({ id: x.id, ...x.data() }))
    return data
  }
}

export function resolveReference<T extends DocumentData>(path: string): CollectionReference<T>
export function resolveReference<T extends DocumentData>(path: string, filter?: string): DocumentReference<T>
export function resolveReference<T extends DocumentData>(path: string, filter?: Filter[] | Filter): Query<T>
export function resolveReference<T extends DocumentData>(path: string, filter?: string | Filter[] | Filter) {
  const colRef = collection(getFirestore(), path) as CollectionReference<T>
  if (typeof filter === 'string') return doc(colRef, filter)
  else if (isFilter(filter)) return query(colRef, where(...filter))
  else if (filter?.every(isFilter)) return query(colRef, ...filter.map(x => where(...x)))
  else if (filter === undefined) return colRef
  else throw Error('Cannot resolve Firestore reference: Invalid `filter` argument.')
}

export function get<T extends DocumentData>(path: string): Promise<T[]>
export function get<T extends DocumentData>(path: string, filter: string): Promise<T>
export function get<T extends DocumentData>(path: string, filter?: string | Filter | Filter[]): Promise<T | T[]>
export function get<T extends DocumentData>(path: string, filter?: string | Filter | Filter[]): Promise<T | T[]> {
  return typeof filter === 'string'
    ? getDoc(resolveReference(path, filter)).then(unpeelSnapshot) as Promise<T>
    : getDocs(resolveReference(path, filter)).then(unpeelSnapshot) as Promise<T[]>
}

export function sync<T extends DocumentData>(data: Ref<T>, path: string, filter: string, onError?: (error: FirestoreError) => void): Unsubscribe
export function sync<T extends DocumentData>(data: Ref<T[]>, path: string, filter?: Filter[] | Filter, onError?: (error: FirestoreError) => void): Unsubscribe
export function sync<T extends DocumentData>(data: Ref<T | T[]>, path: string, filter?: string | Filter[] | Filter, onError?: (error: FirestoreError) => void): Unsubscribe
export function sync<T extends DocumentData>(
  data: Ref<T | T[]>,
  path: string,
  filter?: string | Filter[] | Filter,
  onError?: (error: FirestoreError) => void
) {
  return typeof filter === 'string'
    ? onSnapshot<T>(resolveReference(path, filter), snapshot => data.value = unpeelSnapshot(snapshot), onError)
    : onSnapshot<T>(resolveReference(path, filter), snapshot => data.value = unpeelSnapshot(snapshot), onError)
}

export function remove<T extends DocumentData>(path: string, data: T): Promise<void>
export function remove<T extends DocumentData>(path: string, data: T[]): Promise<void>
export function remove<T extends DocumentData>(path: string, data: string): Promise<void>
export function remove<T extends DocumentData>(path: string, data: string[]): Promise<void>
export function remove(path: string, data: any | any[]) {
  const colRef = collection(getFirestore(), path)
  if(isArray(data)) {
    const batch = writeBatch(getFirestore())
    for(const x of data) batch.delete(doc(colRef, x.id ?? x))
    return batch.commit()
  }
  else return deleteDoc(doc(colRef, data.id ?? data))
}

export function save<T extends DocumentData>(path: string, data: T): Promise<void>
export function save<T extends DocumentData>(path: string, data: T[]): Promise<void>
export function save<T extends DocumentData>(path: string, data: T | T[]): Promise<void>
export function save(path: string, data: DocumentData | DocumentData[]) {
  const colRef = collection(getFirestore(), path)
  if(isArray(data)) {
    const batch = writeBatch(getFirestore())
    for(const x of data) batch.set(doc(colRef, x.id), x)
    return batch.commit()
  }
  else return setDoc(doc(colRef, data.id), data)
}
