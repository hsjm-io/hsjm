/* eslint-disable unicorn/no-null */
import { useVModel } from '@vueuse/core'
import { PropType, computed, defineComponent, h, toRefs } from 'vue-demi'
import { exposeToDevtool } from '../composables'

export const Switch = /* @__PURE__ */ defineComponent({
  name: 'Switch',
  props: {
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'button' },

    // --- State.
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,

    // --- Input.
    modelValue: { type: [Boolean, Number, String, Array], default: false },
    value: { type: [Boolean, Number, String], default: true },
    multiple: Boolean,

    // --- Classes.
    classActive: String,

    // --- Events.
    onClick: Function,
  },

  setup: (properties, { emit, slots }) => {
    // --- Destructure props.
    const { value, multiple, classActive, onClick } = toRefs(properties)

    // --- Compute states variables.
    const model = useVModel(properties, 'modelValue')
    const modelDisabled = useVModel(properties, 'disabled', emit, { passive: true })
    const modelReadonly = useVModel(properties, 'readonly', emit, { passive: true })
    const modelLoading = useVModel(properties, 'loading', emit, { passive: true })

    // --- Compute reactive `active` state.
    const active = computed(() => {
      if (multiple.value && Array.isArray(model.value)) return model.value.includes(value.value)
      if (multiple.value && !Array.isArray(model.value)) return false
      return model.value === value.value
    })

    // --- Define `toggle` method.
    const toggle = async() => {
      // --- If `multiple`, but value invalid, initialize array.
      if (multiple.value && !Array.isArray(model.value)) {
        model.value = [value.value]
      }

      // --- If `multiple`, add or remove value.
      else if (multiple.value && Array.isArray(model.value)) {
        model.value = active.value
          ? [...model.value].filter(x => x !== value.value)
          : [...model.value, value.value]
      }

      // --- If not, set value.
      else if (typeof value.value === 'boolean') {
        model.value = !model.value
      }

      else if (model.value !== value.value) {
        model.value = value.value
      }

      // --- Execute `onClick` handler.
      if (typeof onClick.value === 'function') {
        modelLoading.value = true
        await onClick.value(model.value)
        modelLoading.value = false
      }
    }

    const classes = computed(() => (
      active.value
        ? classActive.value
        : undefined
    ))

    // --- Expose for debugging.
    const slotProperties = exposeToDevtool({
      active,
      modelDisabled,
      modelLoading,
      modelReadonly,
      classes,
      toggle,
    })

    // --- Return virtual DOM node.
    return () => h(properties.as, {
      'disabled': modelDisabled.value || null,
      'readonly': modelReadonly.value || null,
      'aria-disabled': modelDisabled.value || null,
      'aria-readonly': modelReadonly.value || null,
      'aria-busy': modelLoading.value || null,
      'class': classes.value,
      'onClick': toggle,
    }, slots.default?.(slotProperties))
  },
})
