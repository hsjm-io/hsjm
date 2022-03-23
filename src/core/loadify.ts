import { Ref } from 'vue-demi'

/**
 * Wrap an async function to track the loading state of the `Promise`.
 * @param isLoading Reactive `Ref` used to track the loading state.
 * @param func Function to wrap.
 */
export const loadify = <R, TS extends any[]>(isLoading: Ref<boolean>, function_: (...arguments_: TS) => Promise<R>) =>

  // --- Return the wrapped function.
  async(...arguments_: TS): Promise<R> => {
    isLoading.value = true
    const result = await function_(...arguments_)
      .finally(() => isLoading.value = false)
    return result
  }
