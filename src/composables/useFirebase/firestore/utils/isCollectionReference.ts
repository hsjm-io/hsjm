//--- Import dependendies.
import type firebase from 'firebase/app'
import { UseFirestoreQuery } from "../types"

/**
 * Check if `query` is of type `firebase.firestore.CollectionReference`
 * @param query Query to check the type of.
 */
 export const isCollectionReference = (
    query: UseFirestoreQuery
): query is firebase.firestore.CollectionReference => {
    // @ts-ignore
    return query?._delegate?.type === 'collection'
}
