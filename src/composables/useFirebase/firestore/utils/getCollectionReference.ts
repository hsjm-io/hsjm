//--- Import dependendies.
import type firebase from 'firebase/app'
import { firestore } from '..'
import { isCollectionReference } from './isCollectionReference'

/**
 * Gets a `CollectionReference` instance by it's path.
 * @param collection A `CollectionReference` or a slash-separated path to a collection.
 */
 export const getCollectionReference = (
    collection?: firebase.firestore.CollectionReference | string
): firebase.firestore.CollectionReference => {
    
    //--- Argument validation.
    if(!collection) throw new Error("The `collection` argument is undefined.")

    //--- Get the collection reference from a path.
    if(typeof collection === 'string') return firestore().collection(collection)

    //--- Argument is already a collection reference.
    if(isCollectionReference(collection)) return collection
    
    //--- Error handling
    throw new Error("The `collection` argument is neither a path nor a `CollectionReference` instance.")
}
