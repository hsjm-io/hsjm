import { createSharedComposable, isClient, tryOnMounted } from '@vueuse/shared'
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  ActionCodeSettings,
  Auth,
  AuthError,
  AuthProvider,
  ConfirmationResult,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { createUnrefFn } from '@vueuse/core'
import { ref } from 'vue-demi'
import { useRecaptcha } from './useRecaptcha'

export interface UseAuthOptions extends Partial<ActionCodeSettings> {
  onError?: (error: Error) => void
  onSuccess?: (userCredential: UserCredential) => void
  useEmailVerification?: boolean
  useLocalStorage?: boolean
}

export const useAuth = createSharedComposable((options?: UseAuthOptions) => {
  // --- Initialize variables.
  const error = ref<AuthError>()
  const confirmationResult = ref<ConfirmationResult>()
  let auth: Auth | undefined

  const {
    onError,
    onSuccess,
    useEmailVerification,
  } = options ?? {}

  // --- Restore user.
  const user = ref<User | null>()
  const userId = ref<string>()

  // --- Extend `onError` hook.
  const _onError = (_error: AuthError) => {
    error.value = _error
    onError && onError(_error)
  }

  // --- Store auth instance.
  if (isClient) {
    tryOnMounted(() => {
      auth = getAuth()
      auth.useDeviceLanguage()
      onAuthStateChanged(auth, (_user) => {
        user.value = _user
        userId.value = _user?.uid
      })
    })
  }

  // @ts-expect-error: `auth` will be defined on `mounted` hook.
  const loginAnonymously = () => signInAnonymously(auth)
    .then(onSuccess)
    .catch(_onError)

  // @ts-expect-error: `auth` will be defined on `mounted` hook.
  const loginWithProvider = async(provider: AuthProvider) => signInWithPopup(auth, provider)
    .then(onSuccess)
    .catch(_onError)

  // @ts-expect-error: `auth` will be defined on `mounted` hook.
  const loginWithEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password)
    .then(onSuccess)
    .catch(_onError)

  // @ts-expect-error: `auth` && `appVerifier` will be defined on `mounted` hook.
  const loginWithPhone = (phoneNumber: string) => signInWithPhoneNumber(auth, phoneNumber, useRecaptcha())
    .then((data) => { confirmationResult.value = data })
    .catch(_onError)

  const confirmCode = (smsCode: string) => confirmationResult.value?.confirm(smsCode)
    .then(onSuccess)
    .catch(_onError)

  // @ts-expect-error: `auth` will be defined on `mounted` hook.
  const registerWithEmail = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password)
    .then(async(data) => {
      if (useEmailVerification) await sendEmailVerification(data.user, options as any)
      return data
    })
    .then(onSuccess)
    .catch(_onError)

  // @ts-expect-error: `auth` will be defined on `mounted` hook.
  const logout = () => signOut(auth)
    .then(onSuccess as any)
    .catch(_onError)

  return {
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
