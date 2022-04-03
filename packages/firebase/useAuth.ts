import {
  ActionCodeSettings, AuthError, ConfirmationResult, UserCredential,
  createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification, signInAnonymously,
  signInWithEmailAndPassword, signInWithPhoneNumber, signOut,
} from 'firebase/auth'
import { createSharedComposable } from '@vueuse/shared'
import { createUnrefFn } from '@vueuse/core'
import { computed, ref } from 'vue-demi'
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
  const appVerifier = useRecaptcha()

  const {
    onError,
    onSuccess,
    useEmailVerification,
  } = options ?? {}

  // --- Extend `onError` hook.
  const _onError = (_error: AuthError) => {
    error.value = _error
    onError && onError(_error)
  }

  // --- Restore user.
  const user = ref(getAuth().currentUser)
  const userId = computed(() => user.value?.uid ?? '')

  // --- Handles user data lifecycle.
  onAuthStateChanged(getAuth(), async _user => user.value = _user)

  const loginAnonymously = async() => await signInAnonymously(getAuth())
    .then(onSuccess)
    .catch(_onError)

  const loginWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(getAuth(), email, password)
      .then(onSuccess)
      .catch(_onError)

  // @ts-expect-error: `appVerifier` will be defined on `mounted` hook.
  const loginWithPhone = (phoneNumber: string) => signInWithPhoneNumber(getAuth(), phoneNumber, appVerifier)
    .then((data) => { confirmationResult.value = data })
    .catch(_onError)

  const confirmCode = (smsCode: string) => confirmationResult.value?.confirm(smsCode)
    .then(onSuccess)
    .catch(_onError)

  const registerWithEmail = async(email: string, password: string) =>
    await createUserWithEmailAndPassword(getAuth(), email, password)
      .then(async(data) => {
        if (useEmailVerification) await sendEmailVerification(data.user, options as any)
        return data
      })
      .then(onSuccess)
      .catch(_onError)

  const logout = async() => await signOut(getAuth())
    .then(onSuccess as any)
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
