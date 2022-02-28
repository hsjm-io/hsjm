import type firebase from 'firebase'
import { getCollectionReference } from './getCollectionReference'
import { isDocumentReference } from './isDocumentReference'

/**
 * Get a `DocumentReference` for the document within the collection at the specified path.
 * If no path is specified, an automatically-generated unique ID will be used for the
 * returned `DocumentReference`.
 * @param collection A `CollectionReference` or a slash-separated path to a collection.
 * @param document A slash-separated path to a document.
 */
 export const getDocumentReference = (
    collection?: firebase.firestore.CollectionReference | string,
    document?: firebase.firestore.DocumentReference | string,
): firebase.firestore.DocumentReference => {

    //--- Argument validation.
    if(!collection) throw new Error("The `collection` argument is undefined.")
    if(!document) throw new Error("The `document` argument is undefined.")

    //--- Get the document reference from a path.
    if(typeof document === 'string') {
        collection = getCollectionReference(collection)
        return collection.doc(document)
    }

    //--- Argument is already a document reference.
    else if(isDocumentReference(document)) return document
    
    //--- Error handling.
    throw new Error("The `document` argument is neither a path nor a `DocumentReference` instance.")
}