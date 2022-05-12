import { resolvable } from '@hsjm/shared'
import { tryOnScopeDispose } from '@vueuse/shared'
import {
  ActionCodeSettings,
  AuthError,
  AuthProvider,
  ConfirmationResult,
  CustomParameters,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential,
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { reactive, ref } from 'vue-demi'
import { useFirebase } from './useFirebase'
import { useRecaptcha } from './useRecaptcha'

export interface UseAuthOptions extends Partial<ActionCodeSettings> {
  onError?: (error: Error) => void
  onSuccess?: (userCredential: UserCredential) => void
}

export interface LoginWithProviderOptions extends CustomParameters {
  scopes: string
  type: 'popup' | 'redirect'
}

export const useAuth = (options = {} as UseAuthOptions) => {
  // --- Initialize variables.
  const error = ref<AuthError>()
  const confirmationResult = ref<ConfirmationResult>()
  const recatcha = useRecaptcha()
  const { auth } = useFirebase()

  // --- Extract options.
  const { onError, onSuccess } = options

  // --- Restore & watch user.
  const user = ref(auth.currentUser)
  const { promise: ready, resolve } = resolvable()
  const unsubscribe = onAuthStateChanged(auth, (_user) => { user.value = _user; resolve() }, onError)
  tryOnScopeDispose(unsubscribe)

  // --- Extend `onError` hook.
  const _onError = (_error: AuthError) => {
    error.value = _error
    if (onError) onError(_error)
  }

  // --- Anon auth.
  const loginAnonymously = () => signInAnonymously(auth).then(onSuccess).catch(_onError)

  // --- Phone auth.
  const loginWithPhone = (phoneNumber: string) => signInWithPhoneNumber(auth, phoneNumber, <any>recatcha).then((data) => { confirmationResult.value = data }).catch(_onError)
  const confirmCode = (smsCode: string) => confirmationResult.value?.confirm(smsCode).then(onSuccess).catch(_onError)

  // --- Email auth.
  const registerWithEmail = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password).then(onSuccess).catch(_onError)
  const loginWithEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password).then(onSuccess).catch(_onError)

  // --- Oauth.
  const loginFromRedirectResult = () => getRedirectResult(auth).then(result => result && onSuccess && onSuccess(result)).catch(_onError)
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
      return _onError(new Error('Invalid auth provider') as AuthError)

    // --- Start.
    return (type === 'popup' ? signInWithPopup : signInWithRedirect)(auth, provider, browserPopupRedirectResolver)
      .then(onSuccess)
      .catch(_onError)
  }

  // --- Yeet-out.
  const logout = () => signOut(auth).then(<any>onSuccess).catch(_onError)

  return reactive({
    error,
    user,
    ready,
    loginAnonymously,
    loginWithPhone,
    confirmCode,
    registerWithEmail,
    loginWithEmail,
    loginFromRedirectResult,
    loginWithProvider,
    logout,
  })
}
