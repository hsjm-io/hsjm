/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
import { useVModel } from '@vueuse/core'
import { PropType, computed, defineComponent, h, mergeProps, toRefs } from 'vue-demi'
import { exposeToDevtool } from '../utils'

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
  setup: (props, { attrs, slots, emit }) => {
    // --- Destructure props.
    const { value, multiple, classActive } = toRefs(props)

    // --- Compute states variables.
    const model = useVModel(props, 'modelValue')
    const modelDisabled = useVModel(props, 'disabled', emit, { passive: true })
    const modelReadonly = useVModel(props, 'readonly', emit, { passive: true })
    const modelLoading = useVModel(props, 'loading', emit, { passive: true })

    // --- Compute reactive `isActive` state.
    const isActive = computed(() => {
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
        model.value = isActive.value
          ? [...model.value].filter(x => x !== value.value)
          : [...model.value, value.value]
      }

      // --- If not, set value.
      else if (typeof value.value === 'boolean') { model.value = !model.value }

      else if (model.value !== value.value) { model.value = value.value }
    }

    const classes = computed(() => (
      isActive.value
        ? classActive.value
        : undefined
    ))

    // --- Expose to Vue Devtools for debugging.
    const slotProps = exposeToDevtool({
      isActive,
      modelDisabled,
      modelLoading,
      modelReadonly,
      classes,
      toggle,
    })

    // --- Return virtual DOM node.
    return () => h(props.as, mergeProps(attrs, {
      'disabled': modelDisabled.value || null,
      'readonly': modelReadonly.value || null,
      'aria-disabled': modelDisabled.value || null,
      'aria-readonly': modelReadonly.value || null,
      'aria-busy': modelLoading.value || null,
      'class': classes.value,
      'onClick': toggle,
    }), slots.default?.(slotProps))
  },
})
