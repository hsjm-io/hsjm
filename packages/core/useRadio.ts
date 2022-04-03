
import { Ref, computed } from 'vue-demi'
import { MaybeRef } from '@vueuse/shared'

export const useRadio = (
  value: Ref<any[]>,
  key: MaybeRef<any>,
) => {
  // --- Compute reactive `active` state.
  const active = computed(() => value.value === key)

  // --- Initialize `toggle` method.
  const toggle = () => { if (!active.value) value.value = key }

  // --- Return composable properties.
  return { active, toggle }
}
