export interface Resolvable<T> {
  resolved: boolean
  pending: boolean
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
  reset: () => void
}

/**
 * Create a promise and provide it's `resolve` callback and `resolved` state.
 */
export const resolvable = <T extends void>() => {
  // --- Initialize state.
  const state = <Resolvable<T>>{}

  // --- Define lifecycle.
  state.reset = () => {
    state.resolved = false
    state.pending = true

    // --- Init promise.
    state.promise = new Promise<T>((resolve, reject) => {
      state.resolve = resolve
      state.reject = reject
    })

    // --- Extend `resolve` callback.
    state.promise.then(() => state.resolved = true)

    // --- Extend `reject` callback.
    state.promise.catch(() => {
      state.resolved = false
      state.pending = false
    })
  }

  // --- Initalize instance.
  state.reset()

  // --- Return variable.
  return state
}