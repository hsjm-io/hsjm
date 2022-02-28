//--- Import dependendies.
import type firebase from 'firebase/app'
import 'firebase/storage'
import { createGlobalState } from '@vueuse/core'
import { useFirebase } from '..'

/** Initilize or get the default firestore instance. */
export const storage = createGlobalState((): firebase.storage.Storage => {
    return useFirebase().storage()
})

//--- Export module composables.
export * from './useStorage'