//--- Import dependendies.
import type { MaybeRef } from '@vueuse/shared'
import type { UseFirestoreDocument } from '../types'
import { getDocumentDataReference } from './getDocumentDataReference'

/**
 * Deletes the document referred to by this `DocumentReference`.
 * @param document A map of the fields and values for the document.
 */
 export const removeDocument = async (
    document: MaybeRef<UseFirestoreDocument>
): Promise<void> => {

    //--- Get document reference from data object.
    const ref = getDocumentDataReference(document)

    //--- Delete.
    await ref.delete()
}