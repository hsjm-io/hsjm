import { resolvable } from '@hsjm/shared'
import { FirebaseApp } from 'firebase/app'
import { Unsubscribe } from 'firebase/auth'
import { DocumentData, DocumentSnapshot, FirestoreError, QuerySnapshot, SnapshotListenOptions, onSnapshot } from 'firebase/firestore'
import { QueryFilter, firestoreCreateQuery } from './firestoreCreateQuery'
import { firestoreSnapshotData } from './firestoreSnapshotData'

export interface FirestoreSubscribeOptions<T> extends SnapshotListenOptions {
  /**
   * If true, return the first item in the snapshot.
   * @default false
   */
  pickFirst?: boolean
  /**
   * Callback to call when the data changes.
   * @param {T} data The new data.
   */
  onNext?: (data: T | T[] | undefined) => void
  /**
   * Callback to call when an error occurs.
   * @param {Error} error The error.
   */
  onError?: (error: FirestoreError) => void
}

/**
 * Subscribe to a document and call the callback when the document changes.
 * @param {string} path Path to the collection
 * @param {string | undefined | QueryFilter} filter ID or filter parameters.
 * @param {(snapshot: DocumentSnapshot<T>) => void} callback Callback to call when the document changes.
 * @returns {() => void} A function to unsubscribe from the document.
 */
export async function firestoreGet<T = DocumentData>(path: string, filter?: string | QueryFilter<T>, options?: FirestoreSubscribeOptions<T>): Promise<Unsubscribe>
export async function firestoreGet<T = DocumentData>(this: FirebaseApp | undefined, path: string, filter?: string | QueryFilter<T>, options: FirestoreSubscribeOptions<T> = {}) {
  // --- Destructure options.
  const { pickFirst, onError, onNext } = options

  // --- Create the query.
  const query = firestoreCreateQuery.bind(this)(path, filter)
  const ready = resolvable()

  const unsubscribe = onSnapshot(<any>query, options, {
    next: (snapshot: DocumentSnapshot<T> | QuerySnapshot<T>) => {
      const snapshotData = firestoreSnapshotData<T>(snapshot, pickFirst)
      onNext && onNext(snapshotData)
    },
    complete: ready.resolve,
    error: onError,
  })

  // --- Await until the data is loaded.
  return { unsubscribe, ready }
}
