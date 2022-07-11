import { FirebaseOptions, initializeApp } from 'firebase/app'
import { FirestoreSettings, connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore'
import { AppCheckOptions, CustomProvider, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'
import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { Persistence, PopupRedirectResolver, browserLocalPersistence, browserPopupRedirectResolver, browserSessionPersistence, connectAuthEmulator, inMemoryPersistence, indexedDBLocalPersistence, initializeAuth, useDeviceLanguage } from 'firebase/auth'
import { getVariable, isDevelopment, isNotNil, pick } from '@hsjm/shared'
import { createSharedComposable } from '@vueuse/shared'

interface UseFirebaseOptions extends FirebaseOptions, FirestoreSettings {
  /** Local application instance identifier. */
  name?: string
  /** If set to true, enables automatic background refresh of App Check token. */
  isTokenAutoRefreshEnabled?: AppCheckOptions['isTokenAutoRefreshEnabled']
  /** A reCAPTCHA V3 provider, reCAPTCHA Enterprise provider, or custom provider. */
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

/**
 * Creates and initializes a Firebase app instance.
 * Get the default one if it already exists.
 * @param {UseFirebaseOptions} [options] Options to configure the app's services.
 */
export const useFirebase = createSharedComposable((options: UseFirebaseOptions) => {
  // --- Destructure and defaults options.
  const {
    name = '[DEFAULT]',
    apiKey = getVariable('FIREBASE_API_KEY'),
    appId = getVariable('FIREBASE_APP_ID'),
    authDomain = getVariable('FIREBASE_AUTH_DOMAIN'),
    databaseURL = getVariable('FIREBASE_DATABASE_URL'),
    projectId = getVariable('FIREBASE_PROJECT_ID'),
    storageBucket = getVariable('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId = getVariable('FIREBASE_MESSAGING_SENDER_ID'),
    measurementId = getVariable('FIREBASE_MEASUREMENT_ID'),
    host = getVariable('FIREBASE_FIRESTORE_HOST'),
    ssl = getVariable('FIREBASE_FIRESTORE_SSL', Boolean),
    ignoreUndefinedProperties = getVariable('FIREBASE_FIRESTORE_IGNORE_UNDEFINED_PROPERTIES', Boolean),
    cacheSizeBytes = getVariable('FIREBASE_FIRESTORE_CACHE_SIZE_BYTES', Number),
    experimentalAutoDetectLongPolling = getVariable('FIREBASE_FIRESTORE_EXPERIMENTAL_AUTO_DETECT_LONG_POLLING', Boolean),
    experimentalForceLongPolling = getVariable('FIREBASE_FIRESTORE_EXPERIMENTAL_FORCE_LONG_POLLING', Boolean),
    emulatorHost = getVariable('FIREBASE_EMULATOR_HOST'),
    emulatorAuthPort = getVariable('FIREBASE_EMULATOR_AUTH_PORT'),
    emulatorFunctionsPort = getVariable('FIREBASE_EMULATOR_FUNCTIONS_PORT'),
    emulatorFirestorePort = getVariable('FIREBASE_EMULATOR_FIRESTORE_PORT'),
    emulatorStoragePort = getVariable('FIREBASE_EMULATOR_STORAGE_PORT'),
    emulatorDatabasePort = getVariable('FIREBASE_EMULATOR_DATABASE_PORT'),
    appCheckDebugToken = getVariable('FIREBASE_APPCHECK_DEBUG_TOKEN'),
    reCaptchaV3ProviderKey = getVariable('FIREBASE_RECAPTCHA_V3_PROVIDER_KEY'),
    reCaptchaEnterpriseProviderKey = getVariable('FIREBASE_RECAPTCHA_ENTERPRISE_PROVIDER_KEY'),
    isTokenAutoRefreshEnabled,
    popupRedirectResolver = browserPopupRedirectResolver,
    persistence = ['local', 'session', 'memory'],
  } = options

  // --- Prepare auth persistence.
  const _persistence = persistence.map((x) => {
    if (x === 'local') return browserLocalPersistence
    if (x === 'session') return browserSessionPersistence
    if (x === 'indexedDb') return indexedDBLocalPersistence
    if (x === 'memory') return inMemoryPersistence
    return x
  }).filter(Boolean) as Persistence[]

  // --- Initialize app.
  const appOptions = { apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId, measurementId }
  const app = initializeApp(appOptions, name)

  // --- Initialize auth.
  const authOptions = pick({ popupRedirectResolver, persistence: _persistence }, isNotNil)
  const auth = apiKey ? initializeAuth(app, authOptions) : undefined
  if (auth) useDeviceLanguage(auth)

  // --- Initialize firestore.
  const firestoreOptions = pick({ cacheSizeBytes, experimentalForceLongPolling, experimentalAutoDetectLongPolling, host, ssl, ignoreUndefinedProperties }, isNotNil)
  const firestore = initializeFirestore(app, firestoreOptions)

  // --- Initialize RTDB.
  const database = (authDomain && databaseURL) ? getDatabase(app) : undefined

  // --- Initialize storage.
  const storage = storageBucket ? getStorage(app) : undefined
  const functions = getFunctions(app)

  // // --- If available and `isDevelopment`, connect to emulator instances.
  if (isDevelopment && emulatorHost) {
    // @ts-expect-error: ignore
    if (appCheckDebugToken) globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken
    if (emulatorAuthPort && auth) connectAuthEmulator(auth, `http://${emulatorHost}:${emulatorAuthPort}`)
    if (emulatorStoragePort && storage) connectStorageEmulator(storage, emulatorHost, emulatorStoragePort)
    if (emulatorFirestorePort && firestore) connectFirestoreEmulator(firestore, emulatorHost, emulatorFirestorePort)
    if (emulatorFunctionsPort) connectFunctionsEmulator(functions, emulatorHost, emulatorFunctionsPort)
    if (emulatorDatabasePort && database) connectDatabaseEmulator(database, emulatorHost, emulatorDatabasePort)
  }

  // --- Register App Checker.
  let attestationProvider: CustomProvider | ReCaptchaV3Provider | ReCaptchaEnterpriseProvider | undefined
  if (reCaptchaV3ProviderKey) attestationProvider = new ReCaptchaV3Provider(reCaptchaV3ProviderKey)
  if (reCaptchaEnterpriseProviderKey) attestationProvider = new ReCaptchaEnterpriseProvider(reCaptchaEnterpriseProviderKey)
  if (attestationProvider) initializeAppCheck(app, { isTokenAutoRefreshEnabled, provider: attestationProvider })

  // --- Return instances.
  return app
})
