import { DocumentReference, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore'

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

/**
 * Extract data from a snapshot of any type.
 * @param snapshot Snapshot to extract from.
 */
export const getSnapshotData = <T>(snapshot: DocumentSnapshot<T> | QuerySnapshot<T>, pickFirst?: boolean): T | T[] | undefined => {
  // --- If is document snapshot, extract data.
  if (isDocumentSnapshot(snapshot))
    return snapshot.exists() ? snapshot.data() : undefined

  // --- If is query snapshot and empty, return initial value.
  if (snapshot.empty) return

  // --- If result not empty, extract data.
  return pickFirst
    ? snapshot.docs[0].data()
    : snapshot.docs.map(x => x.data())
}
