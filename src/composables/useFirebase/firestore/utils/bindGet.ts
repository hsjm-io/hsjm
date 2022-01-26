//--- Import dependendies.
import type { Ref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/core'
import type { UseFirestoreQuery, UseFirestoreOptions } from '../types'
import { unref } from 'vue-demi'
import { getSnapshotData } from './getSnapshotData'

/**
 * Executes the query and save the data in the `data` reactive variable.
 * 
 * Note: By default, `get()` attempts to provide up-to-date data when
 * possible by waiting for data from the server, but it may return
 * cached data or fail if you are offline and the server cannot be
 * reached. This behavior can be altered via the `GetOptions` parameter.
 * @param data `Ref` to store the data into.
 * @param query Query to use to get the data.
 * @param options — An object to configure the get behavior.
 */
 export const bindGet = async (
    data: Ref<any>,
    query: MaybeRef<UseFirestoreQuery>,
    options?: MaybeRef<UseFirestoreOptions>,
): Promise<void> => {

    //--- Unref arguments.
    query = unref(query)
    options = unref(options)

    //--- Handle missing values.
    if(!data) throw new Error("The `data` argument is undefined. Trying to bind data to nothing.")
    if(!query) throw new Error("The `query` argument is undefined. Trying to query nothing.")

    //--- Get a snapshot, convert it's data and assign it to the data ref.
    const snapshot = await query.get(options)
    data.value = getSnapshotData(snapshot, options)
}
