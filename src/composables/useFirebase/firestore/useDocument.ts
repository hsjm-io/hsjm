//--- Import dependendies.
import type firebase from 'firebase'
import type { MaybeRef } from '@vueuse/shared'
import type { UseFirestoreOptions, UseDocument } from './types'
import { computed, isRef, unref } from 'vue-demi'
import { reactify } from '@vueuse/core'
import { useFirestore } from './useFirestore'
import { loadify, unrefy } from '../utils'
import { partial } from 'lodash-es'
import { cloneDocument, saveDocument, getDocumentReference, removeDocument } from './utils'

/**
 * Bind a `DocumentReference` data to a Vue `Ref` using it's path.
 * @param collection A slash-separated path to a collection.
 * @param document A slash-separated path to a document.
 * @param options Options relative to the `useFirestore` module.
 */
export const useDocument = (
    collection: MaybeRef<firebase.firestore.CollectionReference | string>,
    document: MaybeRef<firebase.firestore.DocumentReference | string>,
    options?: UseFirestoreOptions
): UseDocument => {

    //--- Reactify query safely.
    const documentRef = computed(() => {
        try { return unrefy(getDocumentReference)(collection, document)}
        catch(error){ return undefined }
    })

    //--- Return the `useFirestore` object.
    const useFirestoreInstance = useFirestore(documentRef, { ...options, initialValue: {} })

    //--- Define instance utilities.
    const { data, query: ref, loading } = useFirestoreInstance
    const save = partial(loadify(loading, unrefy(saveDocument)), data)
    const remove = partial(loadify(loading, unrefy(removeDocument)), data)
    const clone = partial(loadify(loading, unrefy(cloneDocument)), data)

    //--- Return the `UseDocument` object.
    return { ...useFirestoreInstance, ref, save, remove, clone } as UseDocument
}
