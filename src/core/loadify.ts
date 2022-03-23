import { Ref } from 'vue-demi'

/**
 * Wrap an async function to track the loading state of the `Promise`.
 * @param isLoading Reactive `Ref` used to track the loading state.
 * @param func Function to wrap. 
 */
export const loadify = <R, TS extends any[]>(isLoading: Ref<boolean>, func: (...args: TS) => Promise<R>,) => {

  //--- Return the wrapped function.
  return async (...args: TS): Promise<R> => {
    isLoading.value = true
    const result = await func(...args)
      .finally(() => isLoading.value = false)
    return result
  };
}
