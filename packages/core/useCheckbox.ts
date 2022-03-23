
import { computed, Ref, unref } from 'vue-demi'
import { MaybeRef } from '@vueuse/core'

export const useCheckbox = (
  value: Ref<any[]>,
  key: MaybeRef<any>
) => {
  
  // --- Compute reactive `active` state.
  const active = computed(() => (value.value ?? []).includes(unref(key)))

  // --- Initialize `toggle` method.
  const toggle = () => {
    const newValue = active.value
      ? [...value.value].filter(x => x !== unref(key))
      : [...value.value].concat(unref(key))

    // --- Make values unique and filter out `nil` values.
    value.value = [...new Set(newValue.filter(x => x !== null && x !== undefined))]
  }

  // --- Return composable properties.
  return { active, toggle }
}
