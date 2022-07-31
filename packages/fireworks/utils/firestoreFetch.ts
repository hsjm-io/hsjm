import { FirebaseApp } from 'firebase/app'
import { DocumentData, DocumentSnapshot, QuerySnapshot, getDoc, getDocFromCache, getDocFromServer, getDocs, getDocsFromCache, getDocsFromServer } from 'firebase/firestore'
import { QueryFilter, firestoreCreateQuery } from './firestoreCreateQuery'
import { firestoreSnapshotData, isDocumentReference } from './firestoreSnapshotData'

export interface FirestoreFetchOptions {
  /**
   * Whether to get data from cache or from server.
   * If not specified, fallback to default behavior.
   * @default undefined
   */
  from?: 'cache' | 'server'
  /**
   * If true, return the first item in the snapshot.
   * @default false
   */
  pickFirst?: boolean
}

/**
 * Fetch data from firestore.
 * @param {string} path Path to the collection
 * @param {string | undefined | QueryFilter} filter ID or filter parameters.
 * @param {boolean} [pickFirst=false] If true, return the first element of the array.
 * @returns {Promise<any>} A promise that resolves to the data
 */
export async function firestoreFetch<T = DocumentData>(path: string, filter: QueryFilter<T>, options?: FirestoreFetchOptions & { pickFirst: true }): Promise<T | undefined>
export async function firestoreFetch<T = DocumentData>(path: string, filter: QueryFilter<T>, options?: FirestoreFetchOptions & { pickFirst: false }): Promise<T[]>
export async function firestoreFetch<T = DocumentData>(path: string, filter: QueryFilter<T>, options?: FirestoreFetchOptions): Promise<T | undefined| T[]>
export async function firestoreFetch<T = DocumentData>(path: string, filter?: string, options?: FirestoreFetchOptions): Promise<T | undefined>
export async function firestoreFetch<T = DocumentData>(path: string, filter?: string | QueryFilter<T>, options?: FirestoreFetchOptions & { pickFirst: true }): Promise<T | undefined>
export async function firestoreFetch<T = DocumentData>(path: string, filter?: string | QueryFilter<T>, options?: FirestoreFetchOptions): Promise<T | undefined| T[]>
export async function firestoreFetch<T = DocumentData>(this: FirebaseApp | undefined, path: string, filter?: string | QueryFilter<T>, options: FirestoreFetchOptions = {}): Promise<T | undefined | T[]> {
  // --- Destructure options.
  const { from, pickFirst } = options

  // --- Create the query.
  const query = firestoreCreateQuery.bind(this)(path, filter)

  // --- Fetch data.
  let snapshot: DocumentSnapshot<T> | QuerySnapshot<T>
  switch (from) {
    case 'cache': snapshot = isDocumentReference(query) ? await getDocFromCache<T>(query) : await getDocsFromCache<T>(query); break
    case 'server': snapshot = isDocumentReference(query) ? await getDocFromServer<T>(query) : await getDocsFromServer<T>(query); break
    default: snapshot = isDocumentReference(query) ? await getDoc<T>(query) : await getDocs<T>(query); break
  }

  // --- Extract data from the snapshot and return it.
  return firestoreSnapshotData<T>(snapshot, pickFirst)
}
