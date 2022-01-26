//--- Import dependendies.
import type firebase from 'firebase/app'
import type { MaybeRef } from '@vueuse/shared'
import type { UseFirestoreOptions, UseFirestoreFilter, UseQuery } from './types'
import { computed, unref } from 'vue-demi'
import { reactify } from '@vueuse/core'
import { useFirestore } from './useFirestore'
import { getQuery } from './utils'
import { unrefy } from '../utils'

/**
 * Bind a document's data to a Vue `Ref` using a filter object.
 * @param collectionPath A slash-separated path to a collection.
 * @param filter An object containing the filtering parameters.
 * @param options Options relative to the `useFirestore` module.
 */
export const useQuery = (
    collection: MaybeRef<firebase.firestore.CollectionReference | string>,
    filter: MaybeRef<UseFirestoreFilter>,
    options?: UseFirestoreOptions
): UseQuery => {

    //--- Reactify query safely.
    const query = computed(() => {
        try { return unrefy(getQuery)(collection, filter)}
        catch(error){ return undefined }
    })

    //--- Return the `useFirestore` object.
    return useFirestore(query, { 
        ...options,
        initialValue: unref(filter)?.limit === 1 ? {} : [],
        takeFirst: unref(filter)?.limit === 1
    }) as UseQuery
}