//--- Import dependendies.
import type firebase from 'firebase/app'
import { isDocumentReference } from './isDocumentReference'
import { UseFirestoreDocument } from '../types'

/**
 * Get the `DocumentReference` from a document's data.
 * @param data Document's data to get the reference from.
 */
export const getDocumentDataReference = (
    data: UseFirestoreDocument
): firebase.firestore.DocumentReference => {

    //--- Throw errors on invalid values.
    if(!data) throw new Error("The `data` object is undefined or null.")
    if(!data.ref) throw new Error("The `ref` property could not be found on the `data` object.")
    if(!isDocumentReference(data.ref)) throw new Error("The `ref` property is not a `DocumentReference` instance.")

    //--- Return document reference.
    return data.ref
}