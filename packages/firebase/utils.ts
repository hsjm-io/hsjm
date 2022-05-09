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

export interface UnpeelSnapshotOptions {
  pickFirst?: boolean
}

export interface UnpeelSnapshot {
  <T = DocumentData>(snapshot: QuerySnapshot<T>, options: UnpeelSnapshotOptions & { pickFirst: true }): T
  <T = DocumentData>(snapshot: QuerySnapshot<T>, options?: UnpeelSnapshotOptions): T[]
  <T = DocumentData>(snapshot: DocumentSnapshot<T>, options?: UnpeelSnapshotOptions): T
  <T = DocumentData>(snapshot: DocumentSnapshot<T> | QuerySnapshot<T>, options?: UnpeelSnapshotOptions): T | T[]
}

/**
 * Extract data from a snapshot of any type.
 * @param snapshot Snapshot to extract from.
 */
export const unpeelSnapshot: UnpeelSnapshot = (snapshot, options = {}): any => {
  const result = isDocumentSnapshot(snapshot)
    ? { id: snapshot.id, ...snapshot.data() }
    : snapshot.docs.map(x => ({ id: x.id, ...x.data() }))
  return Array.isArray(result) && options.pickFirst
    ? result.unshift()
    : result
}
