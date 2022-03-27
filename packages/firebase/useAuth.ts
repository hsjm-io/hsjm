import {
  ActionCodeSettings, AuthError, ConfirmationResult, User, UserCredential,
  createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification, signInAnonymously,
  signInWithEmailAndPassword, signInWithPhoneNumber, signOut,
} from 'firebase/auth'
import { createSharedComposable, createUnrefFn, useStorage } from '@vueuse/core'
import { computed, ref } from 'vue-demi'
import { DocumentData } from 'firebase/firestore'
import { useFirebase } from './useFirebase'

export interface UseAuthOptions extends ActionCodeSettings {
  onSuccess: (userCredential: UserCredential) => void
  onError: (error: Error) => void
  sendEmailVerification: boolean
  useStorage: boolean
}

export const useAuth = createSharedComposable(<T extends DocumentData>(options = {} as UseAuthOptions) => {
  // --- Initialize variables.
  const error = ref<AuthError>()
  const confirmationResult = ref<ConfirmationResult>()
  const appVerifier = useFirebase().recaptchaVerifier

  // --- Extend `onError` hook.
  const _onError = (_error: AuthError) => {
    error.value = _error
    options.onError(_error)
  }

  // --- Restore user.
  const userRestored = getAuth().currentUser ?? {} as User
  const user = options.useStorage ? useStorage('user', userRestored) : ref(userRestored)
  const userId = computed(() => user.value?.uid)

  // --- Handles user data lifecycle.
  onAuthStateChanged(getAuth(), async _user => user.value = _user)

  const loginAnonymously = async() => await signInAnonymously(getAuth())
    .then(options.onSuccess)
    .catch(_onError)

  const loginWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(getAuth(), email, password)
      .then(options.onSuccess)
      .catch(_onError)

  // @ts-expect-error: `appVerifier` will be defined on `mounted` hook.
  const loginWithPhone = (phoneNumber: string) => signInWithPhoneNumber(getAuth(), phoneNumber, appVerifier)
    .then((data) => { confirmationResult.value = data })
    .catch(_onError)

  const confirmCode = (smsCode: string) => confirmationResult.value?.confirm(smsCode)
    .then(options.onSuccess)
    .catch(_onError)

  const registerWithEmail = async(email: string, password: string) =>
    await createUserWithEmailAndPassword(getAuth(), email, password)
      .then(async(data) => {
        if (sendEmailVerification) await sendEmailVerification(data.user, options)
        return data
      })
      .then(options.onSuccess)
      .catch(_onError)

  const logout = async() => await signOut(getAuth())
    .then(options.onSuccess as any)
    .catch(_onError)

  return {
    error,
    user,
    userId,
    loginAnonymously,
    loginWithEmail: createUnrefFn(loginWithEmail),
    loginWithPhone: createUnrefFn(loginWithPhone),
    confirmCode: createUnrefFn(confirmCode),
    registerWithEmail: createUnrefFn(registerWithEmail),
    logout,
  }
})
