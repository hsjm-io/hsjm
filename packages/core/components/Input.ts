/* eslint-disable unicorn/no-null */
import { useVModel } from '@vueuse/core'
import { PropType, computed, defineComponent, h, toRefs } from 'vue-demi'

export const Input = defineComponent({
  name: 'Input',
  inheritAttrs: true,
  props: {
    as: String as PropType<keyof HTMLElementTagNameMap>,

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
    error: String,

    // --- Classes.
    classInput: {} as PropType<any>,
    classLabel: {} as PropType<any>,
    classGroup: {} as PropType<any>,
    classError: {} as PropType<any>,
    classMessage: {} as PropType<any>,
  },
  setup: (properties, { attrs, slots, emit }) => {
    // --- Destructure props.
    const { as, type, name, label, classLabel, classGroup, classInput, classError, classMessage, message } = toRefs(properties)

    // --- Compute states variables.
    const modelValue = useVModel(properties, 'modelValue', emit, { passive: true })
    const modelDisabled = useVModel(properties, 'disabled', emit, { passive: true })
    const modelReadonly = useVModel(properties, 'readonly', emit, { passive: true })
    const modelLoading = useVModel(properties, 'loading', emit, { passive: true })
    const modelError = useVModel(properties, 'error', emit, { passive: true })

    // --- Compute component type.
    const is = computed(() => {
      if (as.value) return as.value
      if (type.value === 'select') return 'select'
      if (type.value === 'textarea') return 'textarea'
      return 'input'
    })

    const $type = computed(() => {
      if (type.value === 'select') return null
      if (type.value === 'textarea') return null
      return 'text'
    })

    const nodeLabel = () => h('label', {
      for: name.value,
      class: classLabel.value,
    }, slots.label?.() ?? label.value)

    const nodeInput = () => h(is.value, {
      ...attrs,
      name,
      'type': $type.value,
      'disabled': modelDisabled.value || null,
      'readonly': modelReadonly.value || null,
      'busy': modelLoading.value || null,
      'aria-disabled': modelDisabled.value || null,
      'aria-readonly': modelReadonly.value || null,
      'aria-busy': modelLoading.value || null,
      'class': classInput.value,
      'value': modelValue.value || null,
      'onInput': (v: any) => modelValue.value = v.target.value,
    })

    const nodeInputGroup = () => h('div', { class: classGroup.value }, [
      slots.prepend?.(),
      nodeInput(),
      slots.append?.(),
    ])

    const nodeMessage = () => h('span', {
      class: modelError.value ? classError.value : classMessage.value,
    }, slots.error?.() ?? modelError.value ?? slots.message?.() ?? message.value)

    // --- Return virtual DOM node.
    return () => h('div', [
      label.value ? nodeLabel() : undefined,
      slots.prepend || slots.append ? nodeInputGroup() : nodeInput(),
      modelError.value || message.value ? nodeMessage() : undefined,
    ])
  },
})
