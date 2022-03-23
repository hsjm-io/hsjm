import { FirebaseOptions, initializeApp } from 'firebase/app'
import { AppCheckOptions, ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { createSharedComposable } from '@vueuse/core'

interface UseFirebaseOptions extends
  FirebaseOptions,
  AppCheckOptions {
  /** Key used to create a ReCaptchaV3Provider instance. */
  reCaptchaV3ProviderKey?: string
}

/**
 * Creates and initializes a Firebase `App` instance.
 * Get the default one if it already exists.
 * @param options Options to configure the app's services.
 * @param name Optional name of the app to initialize.
 */
export const useFirebase = createSharedComposable((
  options: UseFirebaseOptions,
  name?: string,
) => {
  const app = initializeApp(options, name)

  if (options.reCaptchaV3ProviderKey) {
    const provider = new ReCaptchaV3Provider(options.reCaptchaV3ProviderKey)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const appCheck = initializeAppCheck(app, { ...options, provider })
  }

  return app
})
