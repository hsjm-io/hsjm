
import { FirebaseOptions, getApp, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { AppCheckOptions, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'
import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { createSharedComposable } from '@vueuse/core'

interface UseFirebaseOptions extends FirebaseOptions {
  /** Key used to create a `ReCaptchaV3Provider` instance. */
  reCaptchaV3ProviderKey?: string
  /** Key used to create a `ReCaptchaEnterpriseProvider` instance. */
  reCaptchaEnterpriseProviderKey?: string
  /** If set to true, enables automatic background refresh of App Check token. */
  isTokenAutoRefreshEnabled?: AppCheckOptions['isTokenAutoRefreshEnabled']
  /** A reCAPTCHA V3 provider, reCAPTCHA Enterprise provider, or custom provider. */
  attestationProvider?: AppCheckOptions['provider']
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
  // --- Get or instantiate app.
  if (!options) return getApp()
  const app = initializeApp(options)

  // --- If available and in devmode, connect to emulator instances.
  // @ts-expect-error: Types not available.
  if (import.meta.env.DEV) {
    const { emulatorAuthPort, emulatorFunctionsPort, emulatorFirestorePort, emulatorStoragePort, emulatorDatabasePort } = options
    if (emulatorAuthPort) connectAuthEmulator(getAuth(app), `http://localhost:${emulatorAuthPort}`)
    if (emulatorStoragePort) connectStorageEmulator(getStorage(app), 'localhost', emulatorStoragePort)
    if (emulatorFirestorePort) connectFirestoreEmulator(getFirestore(app), 'localhost', emulatorFirestorePort)
    if (emulatorFunctionsPort) connectFunctionsEmulator(getFunctions(app), 'localhost', emulatorFunctionsPort)
    if (emulatorDatabasePort) connectDatabaseEmulator(getDatabase(app), 'localhost', emulatorDatabasePort)
  }

  // --- Register App Checker.
  let { attestationProvider } = options
  const { reCaptchaV3ProviderKey, reCaptchaEnterpriseProviderKey, isTokenAutoRefreshEnabled } = options
  if (!attestationProvider && reCaptchaV3ProviderKey) attestationProvider = new ReCaptchaV3Provider(reCaptchaV3ProviderKey)
  if (!attestationProvider && reCaptchaEnterpriseProviderKey) attestationProvider = new ReCaptchaEnterpriseProvider(reCaptchaEnterpriseProviderKey)
  if (attestationProvider) initializeAppCheck(app, { isTokenAutoRefreshEnabled, provider: attestationProvider })

  // --- Return `FirebaseApp` instance.
  return app
})
