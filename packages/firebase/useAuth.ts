import { resolvable } from '@hsjm/shared'
import { createUnrefFn } from '@vueuse/core'
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
import { ref } from 'vue-demi'
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
  const ready = resolvable()
  const unsubscribe = onAuthStateChanged(auth, (_user) => { user.value = _user; ready.resolve() }, onError)
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
  const loginWithProvider = (provider: AuthProvider | string, options = {} as LoginWithProviderOptions) => {
    const { scopes, type = 'redirect', ...customParameters } = options

    // --- Get provider.
    let _provider = provider
    if (_provider === 'google') _provider = new GoogleAuthProvider()
    if (_provider === 'github') _provider = new GithubAuthProvider()

    // @ts-expect-error: Type
    if (_provider.setCustomParameters && customParameters) (<OAuthProvider>_provider).setCustomParameters(customParameters)
    // @ts-expect-error: Type
    if (_provider.addScope && scopes) scopes.split(/[\s']+/).forEach(scope => (<OAuthProvider>_provider).addScope(scope))

    // --- If invalid, throw error.
    if (typeof _provider === 'string')
      return _onError(new Error('Invalid auth provider') as AuthError)

    // --- Start.
    return (type === 'popup' ? signInWithPopup : signInWithRedirect)(auth, _provider, browserPopupRedirectResolver)
      .then(onSuccess)
      .catch(_onError)
  }

  // --- Yeet-out.
  const logout = () => signOut(auth).then(<any>onSuccess).catch(_onError)

  return {
    auth,
    error,
    user,
    ready: ready.promise,
    loginAnonymously,
    loginWithPhone: createUnrefFn(loginWithPhone),
    confirmCode: createUnrefFn(confirmCode),
    registerWithEmail: createUnrefFn(registerWithEmail),
    loginWithEmail: createUnrefFn(loginWithEmail),
    loginFromRedirectResult,
    loginWithProvider: createUnrefFn(loginWithProvider),
    logout,
  }
}
