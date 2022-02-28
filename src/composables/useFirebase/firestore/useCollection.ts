//--- Import dependendies.
import type firebase from 'firebase'
import type { MaybeRef } from '@vueuse/shared'
import type { UseFirestoreOptions, UseCollection } from './types'
import { useFirestore } from './useFirestore'
import { getCollectionReference, saveDocuments, createDocuments } from './utils'
import { loadify } from 'pompaute/src/composables/loadify'
import { unrefy } from 'pompaute/src/composables/unrefy'
import { partial } from 'lodash-es'
import { computed } from 'vue-demi'

/**
 * Bind a `CollectionReference` data to a Vue `Ref` using it's path.
 * @param collection A slash-separated path to a collection.
 * @param options Options relative to the `useFirestore` module.
 */
export const useCollection = (
    collection: MaybeRef<firebase.firestore.CollectionReference | string>,
    options?: UseFirestoreOptions
): UseCollection => {

    //--- Reactify query safely.
    const collectionRef = computed(() => {
        try { return unrefy(getCollectionReference)(collection)}
        catch(error){ return undefined }
    })

    //--- Return the `useFirestore` object.
    const useFirestoreInstance = useFirestore(collectionRef, { ...options, initialValue: [] })

    //--- Define instance utilities.
    const { data, loading } = useFirestoreInstance as UseCollection
    const save = partial(loadify(loading, unrefy(saveDocuments)), data)
    const add = partial(loadify(loading, unrefy(createDocuments)), data, collectionRef)

    //--- Return the `UseCollection` object.
    return { ...useFirestoreInstance, ref: collectionRef, save, add } as UseCollection
}
