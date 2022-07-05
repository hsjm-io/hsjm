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

export interface GetSnapshotData {
  <T = DocumentData>(snapshot: DocumentSnapshot<T>): T | undefined
  <T = DocumentData>(snapshot: QuerySnapshot<T>): T[]
  <T = DocumentData>(snapshot: QuerySnapshot<T>, pickFirst: true): T | undefined
  <T = DocumentData>(snapshot?: DocumentSnapshot<T> | QuerySnapshot<T>, pickFirst?: boolean): T | T[] | undefined
}

/**
 * Extract data from a snapshot of any type.
 * @param snapshot Snapshot to extract from.
 * @param pickFirst If true, return the first item in the snapshot.
 * @returns The data or undefined.
 */
export const getSnapshotData: GetSnapshotData = (snapshot?: DocumentSnapshot | QuerySnapshot, pickFirst?: any): any => {
  if (!snapshot) return undefined
  const isDocument = isDocumentSnapshot(snapshot)

  // --- If the data doesn't exist, return undefined.
  if (isDocument ? !snapshot.exists() : snapshot.empty) return undefined

  // --- If the data is a document, return the data.
  if (isDocument) return { id: snapshot.id, ...snapshot.data() }

  // --- If the data is a query, and the pickFirst option is true, return the first item.
  if (pickFirst) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }

  // --- If the data is a query, return the data.
  return snapshot.docs.map(document_ => ({ id: document_.id, ...document_.data() }))
}
