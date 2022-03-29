import { createSharedComposable, isClient, tryOnMounted } from '@vueuse/shared'
import { RecaptchaVerifier, getAuth } from 'firebase/auth'

export const useRecaptcha = createSharedComposable(() => {
  let recaptchaVerifier: RecaptchaVerifier | undefined
  if (isClient) {
    tryOnMounted(() => {
      const recaptchaElement = document?.createElement('div')
      if (recaptchaElement) document.querySelector('body')?.append(recaptchaElement)
      recaptchaVerifier = new RecaptchaVerifier(recaptchaElement, { size: 'invisible' }, getAuth())
    }, false)
  }
  return recaptchaVerifier
})
