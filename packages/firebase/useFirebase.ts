
import { FirebaseOptions, getApp, initializeApp } from 'firebase/app'
import { FirestoreSettings, connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore'
import { AppCheckOptions, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'
import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { Dependencies, connectAuthEmulator, initializeAuth } from 'firebase/auth'
import { createSharedComposable } from '@vueuse/shared'
import { isDevelopment } from '@hsjm/shared'

interface UseFirebaseOptions extends
  FirebaseOptions,
  FirestoreSettings,
  Dependencies {
  /** Key used to create a `ReCaptchaV3Provider` instance. */
  reCaptchaV3ProviderKey?: string
  /** Key used to create a `ReCaptchaEnterpriseProvider` instance. */
  reCaptchaEnterpriseProviderKey?: string
  /** If set to true, enables automatic background refresh of App Check token. */
  isTokenAutoRefreshEnabled?: AppCheckOptions['isTokenAutoRefreshEnabled']
  /** A reCAPTCHA V3 provider, reCAPTCHA Enterprise provider, or custom provider. */
  attestationProvider?: AppCheckOptions['provider']
  /** A reCAPTCHA V3 provider, reCAPTCHA Enterprise provider, or custom provider. */
  appCheckDebugToken?: string | boolean
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
export const useFirebase = createSharedComposable((options?: UseFirebaseOptions) => {
  // --- Get app if already initialized.
  if (!options) return getApp()

  // --- Initialize app.
  const app = initializeApp(options)
  const auth = initializeAuth(app, options)
  const firestore = initializeFirestore(app, options)

  // --- If available and in devmode, connect to emulator instances.
  if (isDevelopment) {
    const {
      emulatorHost = 'localhost',
      emulatorAuthPort,
      emulatorFunctionsPort,
      emulatorFirestorePort,
      emulatorStoragePort,
      emulatorDatabasePort,
      appCheckDebugToken,
    } = options
    // @ts-expect-error: Missing `self` definition.
    if (appCheckDebugToken) self.FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken
    if (emulatorAuthPort) connectAuthEmulator(auth, `http://${emulatorHost}:${emulatorAuthPort}`)
    if (emulatorStoragePort) connectStorageEmulator(getStorage(app), emulatorHost, emulatorStoragePort)
    if (emulatorFirestorePort) connectFirestoreEmulator(firestore, emulatorHost, emulatorFirestorePort)
    if (emulatorFunctionsPort) connectFunctionsEmulator(getFunctions(app), emulatorHost, emulatorFunctionsPort)
    if (emulatorDatabasePort) connectDatabaseEmulator(getDatabase(app), emulatorHost, emulatorDatabasePort)
  }

  // --- Register App Checker.
  let { attestationProvider } = options
  const { reCaptchaV3ProviderKey, reCaptchaEnterpriseProviderKey, isTokenAutoRefreshEnabled } = options
  if (!attestationProvider && reCaptchaV3ProviderKey) attestationProvider = new ReCaptchaV3Provider(reCaptchaV3ProviderKey)
  if (!attestationProvider && reCaptchaEnterpriseProviderKey) attestationProvider = new ReCaptchaEnterpriseProvider(reCaptchaEnterpriseProviderKey)
  if (attestationProvider) initializeAppCheck(app, { isTokenAutoRefreshEnabled, provider: attestationProvider })

  // --- Return instances.
  return app
})
