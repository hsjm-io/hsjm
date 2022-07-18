import { Ref, watch } from 'vue-demi'

/**
 * Create a promise that is resolved once the ref is equal to the value.
 * @param {Ref} reference The ref to watch.
 * @param {any} [value=true] The value to watch for.
 */
export const ready = (reference: Ref<any>, value: any = true): Promise<void> =>
  new Promise((resolve) => {
    const unwatch = watch(reference, (newValue) => {
      if (newValue === value) {
        unwatch()
        resolve()
      }
    })
  })
