import { FirebaseOptions, getApp, initializeApp } from 'firebase/app'
import { AppCheckOptions, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { createSharedComposable, tryOnMounted } from '@vueuse/core'
import { RecaptchaVerifier, getAuth } from 'firebase/auth'

interface UseFirebaseOptions extends
  FirebaseOptions,
  AppCheckOptions {
  /** Key used to create a `ReCaptchaV3Provider` instance. */
  reCaptchaV3ProviderKey?: string
  /** Key used to create a `ReCaptchaEnterpriseProvider` instance. */
  reCaptchaEnterpriseProviderKey?: string
}

/**
 * Creates and initializes a Firebase app instance.
 * Get the default one if it already exists.
 * @param options Options to configure the app's services.
 */
export const useFirebase = createSharedComposable((options = {} as UseFirebaseOptions) => {
  const app = options ? initializeApp(options) : getApp()

  const {
    reCaptchaV3ProviderKey,
    reCaptchaEnterpriseProviderKey,
    isTokenAutoRefreshEnabled,
  } = options

  let recaptchaVerifier: RecaptchaVerifier | undefined
  tryOnMounted(() => {
    const recaptchaElement = document?.createElement('div')
    if (recaptchaElement) document.querySelector('body')?.append(recaptchaElement)
    recaptchaVerifier = new RecaptchaVerifier(recaptchaElement, { size: 'invisible' }, getAuth(app))
  })

  const recaptchaProvider = reCaptchaV3ProviderKey ? new ReCaptchaV3Provider(reCaptchaV3ProviderKey) : undefined
  const recaptchaEnterpriseProvider = reCaptchaEnterpriseProviderKey ? new ReCaptchaEnterpriseProvider(reCaptchaEnterpriseProviderKey) : undefined
  const appCheck = recaptchaProvider ? initializeAppCheck(app, { isTokenAutoRefreshEnabled, provider: recaptchaProvider }) : undefined

  return {
    app,
    appCheck,
    recaptchaVerifier,
    recaptchaProvider,
    recaptchaEnterpriseProvider,
  }
})
