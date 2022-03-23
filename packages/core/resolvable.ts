import { ref } from "vue-demi"

/**
 * Create a promise and provide it's `resolve` callback and `resolved` state.
 */
export const resolvable = <T1 extends void>() => {

  // --- Initialize variables.
  let _resolve: (value?: T1) => void
  let _reject: (reason?: any) => void
  let promise = new Promise<T1>((r, e) => { _resolve = r as any; _reject = e })
  const resolved = ref(false)
  const pending = ref(true)

  // --- Extend `resolve` callback.
  const resolve = (value: T1) => {
    _resolve(value)
    resolved.value = true
    pending.value = false
  }

  // --- Extend `reject` callback.
  const reject = (reason?: any) => {
    _reject(reason)
    resolved.value = false
    pending.value = false
  }

  // --- Init promise.
  const reset = () => {
    resolved.value = false
    pending.value = true
    promise = new Promise<T1>((r, e) => { _resolve = r as any; _reject = e })
  }
  reset()

  // --- Return variable.
  return { resolve, reject, promise, resolved, pending, reset }
}
