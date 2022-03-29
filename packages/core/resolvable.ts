import { ref } from 'vue-demi'

/**
 * Create a promise and provide it's `resolve` callback and `resolved` state.
 */
export const resolvable = <T1 extends void>() => {
  // --- Initialize variables.
  let resolve: (value: T1 | PromiseLike<T1>) => void
  let reject: (reason?: any) => void
  let promise = new Promise<T1>((_resolve, _reject) => { resolve = _resolve; reject = _reject })
  const resolved = ref(false)
  const pending = ref(true)

  // --- Extend `resolve` callback.
  promise.then(() => {
    resolved.value = true
    pending.value = false
  })

  // --- Extend `reject` callback.
  promise.catch(() => {
    resolved.value = false
    pending.value = false
  })

  // --- Init promise.
  const reset = () => {
    resolved.value = false
    pending.value = true
    promise = new Promise<T1>((_resolve, _reject) => { resolve = _resolve; reject = _reject })
  }

  // --- Return variable.
  // @ts-expect-error: `resolve` and `reject` are defined almost instantly.
  return { resolve, reject, promise, resolved, pending, reset }
}
