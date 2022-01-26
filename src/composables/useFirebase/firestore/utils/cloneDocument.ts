//--- Import dependendies.
import type firebase from 'firebase/app'
import type { UseFirestoreDocument } from '../types'
import { createDocument } from './createDocument'
import { getDocumentDataReference } from './getDocumentDataReference'

/**
 * Clone a document in the same collection,
 * assigning it a document ID automatically.
 * @param data A map of the fields and values for the document.
 */
 export const cloneDocument = async (
    data: UseFirestoreDocument,
): Promise<firebase.firestore.DocumentReference> => {
    
    //--- Get document reference from data object.
    const ref = getDocumentDataReference(data)
    
    //--- Clone document and return it's reference.
    return await createDocument(data, ref.parent)
}
