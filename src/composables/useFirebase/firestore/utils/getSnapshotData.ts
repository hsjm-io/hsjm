//--- Import dependendies.
import type firebase from 'firebase/app'
import type { UseFirestoreSnapshot, UseFirestoreDocument, UseFirestoreOptions } from '../types'
import { convertFromFirestore } from './convertFromFirestore'
import { defaultsOptions } from './defaultsOptions'

/**
 * Check if `snapshot` is of type `firebase.firestore.QuerySnapshot`
 * @param query Snapshot to check the type of.
 */
const isQuerySnapshot = (
    snapshot: UseFirestoreSnapshot
): snapshot is firebase.firestore.QuerySnapshot => {
    return !!(snapshot as any)?.docs
}

/**
 * Retrieves all fields in the document as an `Object` or all
 * documents in the collection as an `Array`.
 * @param snapshot Snapshot to get the data from.
 * @param options Options.
 */
export const getSnapshotData = (
    snapshot: UseFirestoreSnapshot,
    options?: UseFirestoreOptions
): UseFirestoreDocument | UseFirestoreDocument[] | undefined => {

    //--- Destructure and defaults options.
    const { takeFirst } = defaultsOptions(options)

    //--- If is `QuerySnapshot`, map items recursively.
    if(isQuerySnapshot(snapshot) && takeFirst) return convertFromFirestore(snapshot.docs[0])
    else if(isQuerySnapshot(snapshot) && !takeFirst) return snapshot.docs.map(doc => convertFromFirestore(doc, options))
    else return convertFromFirestore(snapshot as firebase.firestore.DocumentSnapshot)
}
