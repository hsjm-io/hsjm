import { DocumentData, DocumentReference, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore'

/**
 * Check if value is of type `DocumentSnapshot`
 * @param value Value to check.
 */
export const isDocumentReference = (value: any): value is DocumentReference => value
  && typeof value.id === 'string'
  && value.type === 'document'

/**
 * Check if value is of type `DocumentSnapshot`
 * @param value Value to check.
 */
export const isDocumentSnapshot = (value: any): value is DocumentSnapshot => value
  && typeof value.id === 'string'
  && value.ref.type === 'document'

export interface GetSnapshotDataOptions {
  /** Take the first document of a returned array. */
  pickFirst?: boolean
  /** Initial value. */
  initialValue?: any
}

export interface GetSnapshotData {
  <T = DocumentData>(snapshot: QuerySnapshot<T>, options?: GetSnapshotDataOptions & { pickFirst: true }): T
  <T = DocumentData>(snapshot: QuerySnapshot<T>, options?: GetSnapshotDataOptions): T[]
  <T = DocumentData>(snapshot: DocumentSnapshot<T>, options?: GetSnapshotDataOptions): T
  <T = DocumentData>(snapshot: DocumentSnapshot<T> | QuerySnapshot<T>, options?: GetSnapshotDataOptions & { pickFirst: true }): T
  <T = DocumentData>(snapshot: DocumentSnapshot<T> | QuerySnapshot<T>, options?: GetSnapshotDataOptions): T | T[]
}

/**
 * Extract data from a snapshot of any type.
 * @param snapshot Snapshot to extract from.
 */
export const getSnapshotData: GetSnapshotData = (snapshot, options = {}) => {
  // --- Destructure options.
  const { pickFirst, initialValue } = options

  // --- If is document snapshot, extract data.
  if (isDocumentSnapshot(snapshot)) {
    return snapshot.exists()
      ? snapshot.data()
      : initialValue
  }

  // --- If is array of documents, extract data. Default to initial value if no results.
  const data = snapshot.docs.map(x => x.data())
  if (data.length === 0) return initialValue
  return pickFirst ? data[0] : data
}
