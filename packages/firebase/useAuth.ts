import {
  ActionCodeSettings, AuthError, ConfirmationResult, UserCredential, createUserWithEmailAndPassword,
  getAuth, onAuthStateChanged, sendEmailVerification, signInAnonymously, signInWithEmailAndPassword,
  signInWithPhoneNumber, signOut,
} from 'firebase/auth'
import { createGlobalState, createSharedComposable, createUnrefFn, useStorage } from '@vueuse/core'
import { computed, reactive, ref } from 'vue-demi'
import { useFirebase } from './useFirebase'

export const useUser = createSharedComposable(() => {
  const user = useStorage('user', getAuth().currentUser)
  onAuthStateChanged(getAuth(), _user => user.value = _user)
  return reactive(user)
})

interface UseAuthOptions extends ActionCodeSettings {
  onSuccess: (userCredential: UserCredential) => void
  onError: (error: Error) => void
  sendEmailVerification: boolean
  useLocalStorage: boolean
}

export const useAuth = createGlobalState((options = {} as UseAuthOptions) => {
  const error = ref<AuthError>()
  const confirmationResult = ref<ConfirmationResult>()
  const appVerifier = useFirebase().recaptchaVerifier

  const currentUser = getAuth().currentUser
  const user = options.useLocalStorage ? useStorage('user', currentUser) : ref(currentUser)
  onAuthStateChanged(getAuth(), _user => user.value = _user)
  const isLoggedIn = computed(() => user.value?.uid)
  const isEmailVerified = computed(() => user.value?.emailVerified)

  const _onError = (_error: AuthError) => {
    error.value = _error
    options.onError(_error)
  }

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
    user: reactive(user),
    isLoggedIn,
    isEmailVerified,
    loginAnonymously,
    loginWithEmail: createUnrefFn(loginWithEmail),
    loginWithPhone: createUnrefFn(loginWithPhone),
    confirmCode: createUnrefFn(confirmCode),
    registerWithEmail: createUnrefFn(registerWithEmail),
    logout,
  }
})
