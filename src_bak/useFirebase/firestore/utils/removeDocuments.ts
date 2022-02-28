//--- Import dependendies.
import type { UseFirestoreDocument } from '../types'
import { firestore } from '..'
import { getDocumentDataReference } from './getDocumentDataReference'

/**
 * Deletes the documenst referred to their `DocumentReference`.
 * @param documents An array of the documents to delete.
 */
 export const removeDocuments = async (
    documents: UseFirestoreDocument[]
): Promise<void> => {

    //--- Batch delete directive for each documents.
    const batch = firestore().batch()
    for(const document of documents) batch.delete(getDocumentDataReference(document))
    return await batch.commit()
}