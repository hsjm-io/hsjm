//--- Import dependencies.
import firebase from 'firebase/app'
import { createSharedComposable } from '@vueuse/core'

/**
 * Creates and initializes a Firebase `App` instance.
 * Get the default one if it already exists.
 * @param options Options to configure the app's services.
 * @param name Optional name of the app to initialize.
 */
export const useFirebase = createSharedComposable((options?: Object, name?: string): firebase.app.App => {
    return options
        ? firebase.initializeApp(options, name)
        : firebase.app(name)
})

//--- Import sub-composables.
export * from './firestore'
export * from './storage'