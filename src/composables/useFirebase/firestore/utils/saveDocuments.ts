//--- Import dependendies.
import type firebase from 'firebase/app'
import type { UseFirestoreDocument, UseFirestoreOptions } from '../types'
import { firestore } from '..'
import { getDocumentDataReference } from './getDocumentDataReference'
import { convertToFirestore } from './convertToFirestore'

/**
 * Writes to the document referred to by this `DocumentReference`.
 * If the document does not yet exist, it will be created.
 * If you pass `SetOptions`, the provided data can be merged
 * into an existing document.
 * @param documents An array of the documents to save.
 * @param options An object to configure the set behavior.
 */
 export const saveDocuments = async (
    documents?: UseFirestoreDocument[],
    options?: UseFirestoreOptions
): Promise<firebase.firestore.DocumentReference[]> => {
    
    //--- Argument validation.
    if(!documents) throw new Error("The `documents` argument is undefined or empty.")

    //--- Batch save directive for each documents.
    const newRefs: firebase.firestore.DocumentReference[] = []

    //--- Batch save directive for each documents.
    const batch = firestore().batch()
    for(let document of documents) {
        const newRef = getDocumentDataReference(document)
        document = await convertToFirestore(document)
        batch.set(newRef, document, options ?? {})
        newRefs.push(newRef)
    }
    await batch.commit()

    //--- Return refs or new documents.
    return newRefs
}