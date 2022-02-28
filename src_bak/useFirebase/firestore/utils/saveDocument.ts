//--- Import dependendies.
import type { UseFirestoreDocument, UseFirestoreOptions } from '../types'
import { convertToFirestore } from './convertToFirestore'
import { getDocumentDataReference } from './getDocumentDataReference'

/**
 * Writes to the document referred to by this `DocumentReference`.
 * If the document does not yet exist, it will be created.
 * If you pass `SetOptions`, the provided data can be merged
 * into an existing document.
 * @param document A map of the fields and values for the document.
 * @param options An object to configure the set behavior.
 */
 export const saveDocument = async (
    document: UseFirestoreDocument,
    options?: UseFirestoreOptions
): Promise<void> => {

    //--- Get document reference from data object.
    const ref = getDocumentDataReference(document)

    //--- Convert document.
    document = await convertToFirestore(document)

    //--- Save document in it's current state.
    await ref.set(document, options ?? {})
}
