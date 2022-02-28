//--- Import dependendies.
import type { MaybeRef } from '@vueuse/shared'
import type { UseFirestoreQuery, UseFirestoreOptions, UseFirestore } from './types'
import { ref, unref, isRef, watch } from 'vue-demi'
import { tryOnScopeDispose } from '@vueuse/shared'
import { useFetch } from '@nuxtjs/composition-api'
import { loadify } from '../utils'
import { defaultsOptions, bindGet, bindOnSnapshot, bindOnSnapshotAsync } from './utils'
import { partial } from 'lodash-es'

/**
 * Wrap a Firestore query or reference and bind it's value to a reactive `Ref`.
 * If the `initialValue` option is a `Ref` and `autoFetch` options is `true`,
 * the `get` method will be called on each changes, subsequently restarting `onSnapshot` on the new query.
 * @param query Reference or query to use to get the data. 
 * @param options Options to use.
 */
 export const useFirestore = (
    query: MaybeRef<UseFirestoreQuery | undefined>,
    options?: MaybeRef<UseFirestoreOptions>
): UseFirestore => {

    //--- Destructure and defaults options.
    const { 
        autoSubscribe, 
        autoDispose, 
        autoFetch,
        initialValue,
    } = defaultsOptions(unref(options))

    //--- Init reactive data.
    const data = isRef(initialValue) ? initialValue : ref(initialValue)
    const loading = ref(false)

    //--- Define instance utilities.
    const get = partial(loadify(loading, bindGet), data, query)
    const onSnapshot = partial(bindOnSnapshot, data, query)
    const onSnapshotAsync = partial(loadify(loading, bindOnSnapshotAsync), data, query)

    //--- Handle reactivity
    let stopWatch: () => void
    let stopOnSnapshot: () => void

    //--- If query is a `Ref`, watch it and on each changes:
    // Unsubscribe from snapshot.
    // Make sure the query is still defined as it can sometimes be undefined on init.
    // Call the `onSnapshot` method if `autoSubscribe` options is `true`
    // Call the `get` method if `autoFetch` options is `true`
    if(isRef(query)) stopWatch = watch(query, query => {
        if(stopOnSnapshot) stopOnSnapshot()
        if(!query) return
        if(autoSubscribe) stopOnSnapshot = onSnapshot(options)
        else if(autoFetch) get(options)
    })

    //--- Automatically stop the listener and watcher on scope dispose.
    if(autoDispose) tryOnScopeDispose(() => {
        if(stopWatch) stopWatch()
        if(stopOnSnapshot) stopOnSnapshot()
    })

    // @ts-ignore --- Fetch using `useFetch` in the context of a Nuxt app. 
    if(autoFetch && unref(query)) {
        useFetch(async () => {
            if(autoSubscribe) await get(options)
            else stopOnSnapshot = await onSnapshotAsync(options)
        })
    }

    //--- Start `onSnapshot` listener if query is valid.
    else if(autoSubscribe && unref(query)) 
        stopOnSnapshot = onSnapshot(options)

    //--- Return.
    return { data, get, onSnapshot, onSnapshotAsync, query, loading }
}
