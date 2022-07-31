import { FirebaseApp, FirebaseOptions, getApp, initializeApp } from 'firebase/app'
import { FirestoreSettings, connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore'
import { AppCheckOptions, CustomProvider, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
// import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
// import { connectDatabaseEmulator, getDatabase } from 'firebase/database'
// import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { Persistence, PopupRedirectResolver, browserLocalPersistence, browserPopupRedirectResolver, browserSessionPersistence, connectAuthEmulator, inMemoryPersistence, indexedDBLocalPersistence, initializeAuth, useDeviceLanguage } from 'firebase/auth'
import { getVariables, isDevelopment, isNode } from '@hsjm/shared'

interface UseFirebaseOptions extends FirebaseOptions, FirestoreSettings {
  /** Local application instance identifier. */
  name?: string
  /** If set to true, enables automatic background refresh of App Check token. */
  isTokenAutoRefreshEnabled?: AppCheckOptions['isTokenAutoRefreshEnabled']
  /** The `AppCheck` token use for development purposes. */
  appCheckDebugToken?: string | boolean
  /** Key used to create a `ReCaptchaV3Provider` instance. */
  reCaptchaV3ProviderKey?: string
  /** Key used to create a `ReCaptchaEnterpriseProvider` instance. */
  reCaptchaEnterpriseProviderKey?: string
  /** Auth persistence mecanism */
  persistence?: Array<'local' | 'session' | 'memory' | 'indexedDb' | Persistence>
  /** Auth popup/redirect resolver */
  popupRedirectResolver?: PopupRedirectResolver
  /** Emulator port. */
  emulatorHost?: string
  /** Auth emulator port. */
  emulatorAuthPort?: number
  /** Storage emulator port. */
  emulatorStoragePort?: number
  /** Firestore emulator port. */
  emulatorFirestorePort?: number
  /** Database emulator port. */
  emulatorDatabasePort?: number
  /** Functions emulator port. */
  emulatorFunctionsPort?: number
}

declare namespace globalThis {
  /** The `AppCheck` token use for development purposes. */
  let FIREBASE_APPCHECK_DEBUG_TOKEN: UseFirebaseOptions['appCheckDebugToken']
}

const defaultFirebaseOptions = getVariables<UseFirebaseOptions>('FIREBASE', {
  ssl: Boolean,
  ignoreUndefinedProperties: Boolean,
  experimentalAutoDetectLongPolling: Boolean,
  experimentalForceLongPolling: Boolean,
  emulatorAuthPort: Number,
  emulatorFirestorePort: Number,
  emulatorFunctionsPort: Number,
  emulatorStoragePort: Number,
  emulatorDatabasePort: Number,
  persistence: value => value.split(/\s*,\s*/) as any,
})

// --- Global initialized firebase apps.
export const apps: Record<string, UseFirebaseOptions & { app: FirebaseApp }> = {}

/**
 * Creates and initializes a Firebase app instance.
 * Get the default one if it already exists.
 * @param {UseFirebaseOptions} [options] Options to configure the app's services.
 */
export const useFirebase = (options: UseFirebaseOptions = {}) => {
  // --- Defaults and destructure options.
  options = { ...defaultFirebaseOptions, ...options }
  const {
    name = '[DEFAULT]',
    apiKey,
    // authDomain,
    // databaseURL,
    // storageBucket,
    persistence,
    emulatorHost,
    emulatorAuthPort,
    emulatorFirestorePort,
    // emulatorFunctionsPort,
    // emulatorStoragePort,
    // emulatorDatabasePort,
    appCheckDebugToken,
    reCaptchaV3ProviderKey,
    reCaptchaEnterpriseProviderKey,
    isTokenAutoRefreshEnabled,
  } = options

  // --- If the app already exists, return it.
  if (apps[name]) return apps[name].app

  // --- Prepare auth persistence.
  const persistenceNormalized = !isNode
    ? persistence?.map((x) => {
      switch (x) {
        case 'local': return browserLocalPersistence
        case 'session': return browserSessionPersistence
        case 'indexedDb': return indexedDBLocalPersistence
        case 'memory': return inMemoryPersistence
        default: return x
      }
    }).filter(Boolean)
    : undefined

  // --- Initialize app.
  const app = initializeApp(options)
  const auth = apiKey && !isNode && initializeAuth(app, { ...options, persistence: persistenceNormalized })
  const firestore = initializeFirestore(app, options)
  // const database = isBrowser && authDomain && databaseURL && getDatabase(app)
  // const storage = isBrowser && storageBucket ? getStorage(app) : undefined
  // const functions = getFunctions(app)
  if (auth) useDeviceLanguage(auth)

  // // --- If available and `isDevelopment`, connect to emulator instances.
  if (isDevelopment && emulatorHost) {
    if (appCheckDebugToken) globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken
    if (emulatorAuthPort && auth) connectAuthEmulator(auth, `http://${emulatorHost}:${emulatorAuthPort}`)
    if (emulatorFirestorePort && firestore) connectFirestoreEmulator(firestore, emulatorHost, emulatorFirestorePort)
    // if (emulatorStoragePort && storage) connectStorageEmulator(storage, emulatorHost, emulatorStoragePort)
    // if (emulatorFunctionsPort) connectFunctionsEmulator(functions, emulatorHost, emulatorFunctionsPort)
    // if (emulatorDatabasePort && database) connectDatabaseEmulator(database, emulatorHost, emulatorDatabasePort)
  }

  // --- Register App Checker.
  if (!isNode) {
    let attestationProvider: CustomProvider | ReCaptchaV3Provider | ReCaptchaEnterpriseProvider | undefined
    if (reCaptchaV3ProviderKey) attestationProvider = new ReCaptchaV3Provider(reCaptchaV3ProviderKey)
    if (reCaptchaEnterpriseProviderKey) attestationProvider = new ReCaptchaEnterpriseProvider(reCaptchaEnterpriseProviderKey)
    if (attestationProvider) initializeAppCheck(app, { isTokenAutoRefreshEnabled, provider: attestationProvider })
  }

  // --- Return instances.
  apps[app.name] = { ...options, app }
  return app
}
