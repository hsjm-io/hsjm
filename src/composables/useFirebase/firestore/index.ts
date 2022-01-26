//--- Import dependendies.
import type firebase from 'firebase/app'
import 'firebase/firestore'
import { createGlobalState } from '@vueuse/core'
import { useFirebase } from '..'

/** Initilize or get the default firestore instance. */
export const firestore = createGlobalState((): firebase.firestore.Firestore => {
    return useFirebase().firestore()
})

//--- Export module composables.
export * from './useFirestore'
export * from './useCollection'
export * from './useDocument'
export * from './useQuery'