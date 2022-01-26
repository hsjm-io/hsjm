//--- Import dependendies.
import type firebase from 'firebase/app'
import { UseFirestoreQuery } from "../types"

/**
 * Check if `query` is of type `firebase.firestore.query`
 * @param query Query to check the type of.
 */
 export const isQuery = (
    query: UseFirestoreQuery
): query is firebase.firestore.Query => {
    // @ts-ignore
    return query?._delegate.type === 'query'
}