import { createSharedComposable, tryOnMounted } from '@vueuse/shared'
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  ActionCodeSettings,
  AuthError,
  AuthProvider,
  ConfirmationResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  UserCredential,
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  sendEmailVerification,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { createUnrefFn } from '@vueuse/core'
import { ref } from 'vue-demi'
import { useFirebase } from './useFirebase'
import { useRecaptcha } from './useRecaptcha'

export interface UseAuthOptions extends Partial<ActionCodeSettings> {
  onError?: (error: Error) => void
  onSuccess?: (userCredential: UserCredential) => void
  useEmailVerification?: boolean
  useLocalStorage?: boolean
}

export const useAuth = createSharedComposable((options = {} as UseAuthOptions) => {
  // --- Initialize variables.
  const error = ref<AuthError>()
  const confirmationResult = ref<ConfirmationResult>()
  const app = useFirebase()
  const recatcha = useRecaptcha()
  const auth = getAuth(app)
  auth.useDeviceLanguage()

  // --- Extract options.
  const {
    onError,
    onSuccess,
    useEmailVerification,
  } = options

  // --- Restore user.
  const user = ref(auth.currentUser)
  const userId = ref(auth.currentUser?.uid)

  // --- Extend `onError` hook.
  const _onError = (_error: AuthError) => {
    error.value = _error
    if (onError) onError(_error)
  }

  // --- Store auth instance.
  onAuthStateChanged(auth, (_user) => {
    user.value = _user
    userId.value = _user?.uid
  })

  tryOnMounted(async() => {
    await getRedirectResult(auth, browserPopupRedirectResolver)
      .then((result) => {
        if (result?.providerId === 'google') GoogleAuthProvider.credentialFromResult(result)
        if (result?.providerId === 'github') GithubAuthProvider.credentialFromResult(result)
        if (onSuccess) onSuccess(result)
      })
      .catch(_onError)
  })

  const loginAnonymously = () => signInAnonymously(auth)
    .then(onSuccess)
    .catch(_onError)

  const loginWithProvider = (provider: AuthProvider | string, popup?: boolean) => {
    // --- Get provider.
    let _provider = provider
    if (_provider === 'google') _provider = new GoogleAuthProvider()
    if (_provider === 'github') _provider = new GithubAuthProvider()
    if (typeof _provider === 'string') return _onError(new Error('Invalid auth provider') as AuthError)

    return (popup ? signInWithPopup : signInWithRedirect)(auth, _provider, browserPopupRedirectResolver)
      .then((result) => {
        if (provider === 'google') GoogleAuthProvider.credentialFromResult(result)
        if (provider === 'github') GithubAuthProvider.credentialFromResult(result)
        if (onSuccess) onSuccess(result)
      })
      .catch(_onError)
  }

  const loginWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)
      .then(onSuccess)
      .catch(_onError)

  const loginWithPhone = (phoneNumber: string) =>
    signInWithPhoneNumber(auth, phoneNumber, <any>recatcha)
      .then((data) => { confirmationResult.value = data })
      .catch(_onError)

  const confirmCode = (smsCode: string) =>
    confirmationResult.value?.confirm(smsCode)
      .then(onSuccess)
      .catch(_onError)

  const registerWithEmail = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password)
      .then(async(data) => {
        if (useEmailVerification) await sendEmailVerification(data.user, options as any)
        return data
      })
      .then(onSuccess)
      .catch(_onError)

  const logout = () =>
    signOut(auth)
      .then(<any>onSuccess)
      .catch(_onError)

  return {
    auth,
    error,
    user,
    userId,
    loginAnonymously,
    loginWithProvider,
    loginWithEmail: createUnrefFn(loginWithEmail),
    loginWithPhone: createUnrefFn(loginWithPhone),
    confirmCode: createUnrefFn(confirmCode),
    registerWithEmail: createUnrefFn(registerWithEmail),
    logout,
  }
})
