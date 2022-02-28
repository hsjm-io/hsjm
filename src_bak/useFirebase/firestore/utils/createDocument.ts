//--- Import dependendies.
import type firebase from 'firebase/app'
import type { UseFirestoreDocument } from '../types'
import { getCollectionReference } from './getCollectionReference'

/**
 * Add a new document to this collection with the specified data,
 * assigning it a document ID automatically.
 * @param document An array of the documents to save.
 * @param collection Collection reference or path to store the document into.
 */
 export const createDocument = async (
    document: UseFirestoreDocument,
    collection?: firebase.firestore.CollectionReference | string,
): Promise<firebase.firestore.DocumentReference> => {

    //--- Resolve collection reference.
    collection = getCollectionReference(collection)

    //--- Add document in collection and return it's reference.
    return await collection.add(document)
}
