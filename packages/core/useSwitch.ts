/* eslint-disable unicorn/no-null */
import { Ref, computed, reactive, unref } from 'vue-demi'
import { MaybeRef } from '@vueuse/shared'
import { compact } from '@hsjm/shared'

export interface UseSwitchOptions {
  unique?: boolean
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  classActive?: string
  onClick?: () => void
}

export const useSwitch = (model: Ref<any>, value: MaybeRef<any>, options = {} as UseSwitchOptions) => {
  // --- Compute reactive `active` state.
  const active = computed(() => (
    options.unique
      ? model.value === unref(value)
      : (model.value ?? []).includes(unref(value))
  ))

  // --- Define `toggle` method.
  const toggle = () => {
    // --- Set value.
    if (options.unique) {
      if (!active.value) model.value = unref(value)
    }

    // --- Push value.
    else {
      const newValue = active.value
        ? [...model.value].filter(x => x !== unref(value))
        : [...model.value, unref(value)]

      // --- Make values unique and filter out `nil` values.
      model.value = compact(newValue)
    }
  }

  // --- Compute element attributes.
  const attributes = reactive({
    'onClick': toggle, // computed(() => options.onClick ?? toggle),
    'class': computed(() => (active.value ? options.classActive : 'foobaar')),
    'disabled': computed(() => options.disabled || null),
    'readonly': computed(() => options.readonly || null),
    'loading': computed(() => options.loading || null),
    'aria-disabled': computed(() => options.disabled || null),
    'aria-readonly': computed(() => options.readonly || null),
    'aria-busy': computed(() => options.loading || null),
  })

  // --- Return composable properties.
  return { active, toggle, attributes }
}
