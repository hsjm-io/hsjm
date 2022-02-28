//--- Import dependendies.
import type firebase from 'firebase/app'
import { firestore } from '..'
import type { UseFirestoreDocument } from '../types'
import { getCollectionReference } from './getCollectionReference'

/**
 * Add a new document to this collection with the specified data,
 * assigning it a document ID automatically.
 * @param data An array of the documents to save.
 * @param collection Collection reference or path to store the document into.
 */
 export const createDocuments = async (
    documents?: UseFirestoreDocument[],
    collection?: firebase.firestore.CollectionReference | string,
): Promise<void> => {
    
    //--- Argument validation.
    if(!documents) throw new Error("The `documents` argument is undefined or empty.")

    //--- Resolve collection reference.
    collection = getCollectionReference(collection)

    //--- Batch create each documents and commit.
    const batch = firestore().batch()
    for(const document of documents) batch.set(collection.doc(), document)
    return await batch.commit()
}
