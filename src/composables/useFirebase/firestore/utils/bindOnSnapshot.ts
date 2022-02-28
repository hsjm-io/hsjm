//--- Import dependendies.
import type { Ref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/core'
import type { UseFirestoreQuery, UseFirestoreSnapshot, UseFirestoreOptions } from '../types'
import { unref } from 'vue-demi'
import { getSnapshotData, defaultsOptions } from '.'

/**
 * Attaches a listener for `QuerySnapshot` events and save results in the
 * `data` reactive variable. You may either pass an `onError` callback by defining
 * the `options.onError` property. The listener can be auto-cancelled by
 * setting `options.autoDispose: true`.
 * @param data `Ref` to store the data into.
 * @param query Query to use to get the data.
 * @param options Options to use.
 */
 export const bindOnSnapshot = (
    data: Ref<any>,
    query: MaybeRef<UseFirestoreQuery>,
    options?: MaybeRef<UseFirestoreOptions>,
): (() => void) => {

    //--- Unref arguments.
    query = unref(query)
    options = unref(options)

    //--- Handle missing values.
    if(!data) throw new Error("The `data` argument is undefined. Trying to bind data to nothing.")
    if(!query) throw new Error("The `query` argument is undefined. Trying to query nothing.")

    //--- Destructure and defaults options.
    const { errorHandler } = defaultsOptions(options)
    
    // @ts-ignore --- Apply data to the ref on each snapshot.
    const unsubscribe = query.onSnapshot({
        next: (snapshot: UseFirestoreSnapshot) => data.value = getSnapshotData(snapshot, options as UseFirestoreOptions), 
        error: errorHandler
    })

    //--- Return unsubscribe method.
    return unsubscribe
}
