/* eslint-disable unicorn/no-null */
import { PropType, computed, defineComponent, h, mergeProps, toRefs } from 'vue-demi'
import { useVModel } from '@vueuse/core'
import { IconifyIconCustomisations } from '@iconify/iconify'
import { exposeToDevtool, resolveComponentType } from '../composables'

export const Input = /* @__PURE__ */ defineComponent({
  name: 'Input',
  inheritAttrs: true,
  props: {
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'input' },

    // --- State.
    modelValue: {},
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,

    // --- Input.
    type: String as PropType<HTMLInputElement['type']>,
    name: String,
    label: String,
    message: String,
    error: String as PropType<string>,

    // --- Icon
    icon: String,
    iconAppend: String,
    iconPrepend: String,
    iconOptions: Object as PropType<IconifyIconCustomisations>,

    // --- Classes.
    classInput: {} as PropType<any>,
    classLabel: {} as PropType<any>,
    classGroup: {} as PropType<any>,
    classError: {} as PropType<any>,
    classMessage: {} as PropType<any>,
  },
  setup: (props, { attrs, slots, emit }) => {
    const { as, type, classInput } = toRefs(props)

    // --- Compute states variables.
    const modelValue = useVModel(props, 'modelValue', emit, { passive: true })
    const modelDisabled = useVModel(props, 'disabled', emit, { passive: true })
    const modelReadonly = useVModel(props, 'readonly', emit, { passive: true })
    const modelLoading = useVModel(props, 'loading', emit, { passive: true })
    const modelError = useVModel(props, 'error', emit, { passive: true })

    // --- Compute input tagname.
    const is = computed(() => {
      if (type.value === 'select') return 'select'
      if (type.value === 'textarea') return 'textarea'
      return as.value
    })

    // --- Compute component type.
    const inputType = computed(() => {
      if (type.value === 'select') return null
      if (type.value === 'textarea') return null
      return type.value
    })

    // --- Expose for debugging.
    const slotProperties = exposeToDevtool({
      is,
      modelValue,
      modelDisabled,
      modelReadonly,
      modelLoading,
      modelError,
      inputType,
    })

    // --- Return virtual DOM node.
    return () => {
      const nodeInput = h(
        resolveComponentType<any>(is.value),
        mergeProps({ ...attrs, class: undefined, style: undefined }, {
          'name': props.name,
          'type': inputType.value,
          'disabled': modelDisabled.value || null,
          'readonly': modelReadonly.value || null,
          'busy': modelLoading.value || null,
          'aria-disabled': modelDisabled.value || null,
          'aria-readonly': modelReadonly.value || null,
          'aria-busy': modelLoading.value || null,
          'class': classInput.value,
          'value': modelValue.value || null,
          'onInput': (v: any) => modelValue.value = v.target.value,
        }),
      )

      // --- Create label VNode
      const nodeLabel = props.label
        ? h('label', { for: props.name, class: props.classLabel }, slots.label?.() ?? props.label)
        : undefined

      const nodeMessage = props.message
        ? h('span', { class: props.classMessage }, slots.message?.(slotProperties) ?? props.message)
        : undefined

      const nodeError = props.error
        ? h('span', { class: props.classError }, slots.error?.(slotProperties) ?? props.error)
        : undefined

      const nodeInputGroup = (slots.prepend || slots.append)
        ? h('div', { class: props.classGroup }, [slots.prepend?.(), nodeInput, slots.append?.()])
        : nodeInput

      // --- Return virtual DOM node.
      return h('div', [nodeLabel, nodeInputGroup, nodeError ?? nodeMessage])
    }
  },
})
