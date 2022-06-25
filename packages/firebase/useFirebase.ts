
import { FirebaseOptions, getApp, initializeApp } from 'firebase/app'
import { FirestoreSettings, connectFirestoreEmulator, getFirestore, initializeFirestore } from 'firebase/firestore'
import { AppCheckOptions, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'
import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { Persistence, PopupRedirectResolver, browserLocalPersistence, browserPopupRedirectResolver, browserSessionPersistence, connectAuthEmulator, getAuth, inMemoryPersistence, indexedDBLocalPersistence, initializeAuth, useDeviceLanguage } from 'firebase/auth'
import { createSharedComposable } from '@vueuse/shared'
import { isDevelopment } from '@hsjm/shared'

interface UseFirebaseOptions extends
  FirebaseOptions,
  FirestoreSettings {
  /** Local application instance identifier. */
  name?: string

  // --- App Check
  /** If set to true, enables automatic background refresh of App Check token. */
  isTokenAutoRefreshEnabled?: AppCheckOptions['isTokenAutoRefreshEnabled']
  /** A reCAPTCHA V3 provider, reCAPTCHA Enterprise provider, or custom provider. */
  appCheckDebugToken?: string | boolean
  /** Key used to create a `ReCaptchaV3Provider` instance. */
  reCaptchaV3ProviderKey?: string
  /** Key used to create a `ReCaptchaEnterpriseProvider` instance. */
  reCaptchaEnterpriseProviderKey?: string

  // --- Auth.
  /** Auth persistence mecanism */
  persistence?: Array<'local' | 'session' | 'memory' | 'indexedDb' | Persistence>
  /** Auth popup/redirect resolver */
  popupRedirectResolver?: PopupRedirectResolver

  // --- Emulator.
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

/**
 * Creates and initializes a Firebase app instance.
 * Get the default one if it already exists.
 * @param options Options to configure the app's services.
 */
export const useFirebase = createSharedComposable((options?: UseFirebaseOptions | string) => {
  // --- Get app if already initialized.
  if (!options || typeof options === 'string') {
    const app = getApp(options)
    return {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app),
      functions: getFunctions(app),
      database: getDatabase(app),
    }
  }

  // --- Destructure options.
  const {
    name,
    emulatorHost = 'localhost',
    emulatorAuthPort,
    emulatorFunctionsPort,
    emulatorFirestorePort,
    emulatorStoragePort,
    emulatorDatabasePort,
    appCheckDebugToken,
    reCaptchaV3ProviderKey,
    reCaptchaEnterpriseProviderKey,
    isTokenAutoRefreshEnabled,
    popupRedirectResolver = browserPopupRedirectResolver,
    persistence = ['local', 'session', 'memory'],
  } = options

  // --- Prepare auth persistence.
  const _persistence = persistence.map((x) => {
    if (typeof x !== 'string') return x
    if (x === 'local') return browserLocalPersistence
    if (x === 'session') return browserSessionPersistence
    if (x === 'indexedDb') return indexedDBLocalPersistence
    return inMemoryPersistence
  })

  // --- Initialize app.
  const app = initializeApp(options, name)
  const auth = initializeAuth(app, { popupRedirectResolver, persistence: _persistence })
  const firestore = initializeFirestore(app, options)
  const storage = getStorage(app)
  const functions = getFunctions(app)
  const database = getDatabase(app)
  useDeviceLanguage(auth)

  // --- If available and in devmode, connect to emulator instances.
  if (isDevelopment) {
    // @ts-expect-error: Missing `self` definition.
    if (appCheckDebugToken) self.FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken
    if (emulatorAuthPort) connectAuthEmulator(auth, `http://${emulatorHost}:${emulatorAuthPort}`)
    if (emulatorStoragePort) connectStorageEmulator(storage, emulatorHost, emulatorStoragePort)
    if (emulatorFirestorePort) connectFirestoreEmulator(firestore, emulatorHost, emulatorFirestorePort)
    if (emulatorFunctionsPort) connectFunctionsEmulator(functions, emulatorHost, emulatorFunctionsPort)
    if (emulatorDatabasePort) connectDatabaseEmulator(database, emulatorHost, emulatorDatabasePort)
  }

  // --- Register App Checker.
  let attestationProvider: any
  if (reCaptchaV3ProviderKey) attestationProvider = new ReCaptchaV3Provider(reCaptchaV3ProviderKey)
  if (reCaptchaEnterpriseProviderKey) attestationProvider = new ReCaptchaEnterpriseProvider(reCaptchaEnterpriseProviderKey)
  if (attestationProvider) initializeAppCheck(app, { isTokenAutoRefreshEnabled, provider: attestationProvider })

  // --- Return instances.
  return { app, auth, firestore, storage, functions, database }
})
