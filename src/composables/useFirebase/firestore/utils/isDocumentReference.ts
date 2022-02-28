//--- Import dependendies.
import type firebase from 'firebase/app'
import { UseFirestoreQuery } from "../types"

/**
 * Check if `query` is of type `firebase.firestore.DocumentReference`
 * @param query Query to check the type of.
 */
 export const isDocumentReference = (
    query: UseFirestoreQuery
): query is firebase.firestore.DocumentReference => {
    // @ts-ignore
    return query?._delegate?.type === 'document'
}
