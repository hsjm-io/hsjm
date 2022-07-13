/* eslint-disable unicorn/consistent-destructuring */

import { ActionCodeSettings, Auth, AuthError, AuthProvider, ConfirmationResult, CustomParameters, GithubAuthProvider, GoogleAuthProvider, OAuthProvider, RecaptchaVerifier, User, UserCredential, browserPopupRedirectResolver, createUserWithEmailAndPassword, getAuth, getRedirectResult, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signInWithPhoneNumber, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import { tryOnMounted, tryOnScopeDispose } from '@vueuse/shared'
import { isBrowser } from '@hsjm/shared'
import { ref } from 'vue-demi'
import { FirebaseApp } from 'firebase/app'

export interface UseAuthOptions extends Partial<ActionCodeSettings> {
  onError?: (error: AuthError) => void
  /** On auth login. */
  onLogin?: (userCredential: UserCredential) => void
  /** On auth logout. */
  onLogout?: () => void
  /** Firebase auth instance. */
  auth?: Auth
  /** Firebase app instance. */
  app?: FirebaseApp
}

export interface LoginWithProviderOptions extends CustomParameters {
  scopes: string
  type: 'popup' | 'redirect'
}

/**
 * Create a shared Firebase Auth composition.
 * @param {UseAuthOptions} [options] Auth options.
 * @return A shared Firebase Auth composition.
 */
export const useAuth = (options: UseAuthOptions = {}) => {
  // --- Destructure and default options.
  const { onError = console.error, onLogin, onLogout, auth = getAuth(options.app) } = options
  if (!auth) throw new Error('No auth instance found')

  // --- Initialize variables.
  let confirmationResult: ConfirmationResult | undefined
  let recaptchaVerifier: RecaptchaVerifier | undefined

  // --- Restore & watch user.
  const user = ref<User | null>()
  const unsubscribe = onAuthStateChanged(auth, state => user.value = state, onError)
  tryOnScopeDispose(unsubscribe)

  // --- Create a RecaptchaVerifier on mount
  if (isBrowser) {
    tryOnMounted(() => {
      const recaptchaElement = document.createElement('div')
      recaptchaVerifier = new RecaptchaVerifier(recaptchaElement, { size: 'invisible' }, auth)
    }, false)
  }

  // --- Anon auth.
  const loginAnonymously = () => signInAnonymously(auth)
    .then(onLogin)
    .catch(onError)

  // --- Phone auth.
  const loginWithPhone = (phoneNumber: string) => {
    if (!recaptchaVerifier) throw new Error('No recaptcha verifier found')
    return recaptchaVerifier && signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      .then((data) => { confirmationResult = data })
      .catch(onError)
  }

  const confirmCode = (smsCode: string) => {
    if (!confirmationResult) throw new Error('No confirmation result found')
    return confirmationResult?.confirm(smsCode)
      .then(onLogin)
      .catch(onError)
  }

  // --- Email auth.
  const registerWithEmail = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password)
    .then(onLogin)
    .catch(onError)

  // --- Login with email & password.
  const loginWithEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password)
    .then(onLogin)
    .catch(onError)

  // --- Login from a redirect.
  const loginFromRedirectResult = () => getRedirectResult(auth)
    .then((result) => {
      if (result && onLogin) onLogin(result)
      return result
    })
    .catch(onError)

  const loginWithProvider = (provider: AuthProvider | OAuthProvider | string, options = {} as LoginWithProviderOptions) => {
    const { scopes, type = 'redirect', ...customParameters } = options

    // --- Get provider.
    if (provider === 'google') provider = new GoogleAuthProvider()
    else if (provider === 'github') provider = new GithubAuthProvider()
    else if (typeof provider === 'string') throw new Error(`Provider ${provider} does not exists.`)

    // --- Set parameters & add scopes.
    if ('addScope' in provider && scopes) scopes.split(/[\s']+/).forEach(scope => (<OAuthProvider>provider).addScope(scope))
    if ('setCustomParameters' in provider && customParameters) provider.setCustomParameters(customParameters)

    // --- If invalid, throw error.
    if (typeof provider === 'string')
      throw new Error(`Provider ${provider} does not exists.`)

    // --- Start.
    const signIn = type === 'popup' ? signInWithPopup : signInWithRedirect
    return signIn(auth, provider, browserPopupRedirectResolver)
      .then(onLogin)
      .catch(onError)
  }

  // --- Yeet-out.
  const logout = () => signOut(auth)
    .then(onLogout)
    .catch(onError)

  // --- Return the composition.
  return {
    user,
    loginAnonymously,
    loginWithPhone,
    confirmCode,
    registerWithEmail,
    loginWithEmail,
    loginFromRedirectResult,
    loginWithProvider,
    logout,
  }
}
