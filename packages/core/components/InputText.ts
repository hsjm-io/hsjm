/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
import { PropType, computed, defineComponent, getCurrentInstance, h, mergeProps } from 'vue-demi'
import { get, isNil, omit } from '@hsjm/shared'
import { useVModel } from '@vueuse/core'
import { exposeToDevtool } from '../composables'

export const InputText = /* @__PURE__ */ defineComponent({
  name: 'InputText',
  inheritAttrs: true,
  props: {
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'input' },
    type: { type: String as PropType<HTMLInputElement['type']>, default: 'text' },
    name: String,
    required: Boolean,

    // --- State
    modelValue: {} as PropType<any>,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,

    // --- Select/Datalist
    items: { type: [Array, Object] as PropType<any[] | Record<string, any>>, default: () => [] },
    itemKey: [String, Function],
    itemLabel: [String, Function],
    itemValue: [String, Function],
    itemDisabled: [String, Function],

    // --- Classes
    classOption: String,
  },
  emits: [
    'input',
    'update:modelValue',
  ],
  setup: (props, { attrs, slots, emit }) => {
    // --- Two-way bindings.
    const modelValue = useVModel(props, 'modelValue', emit, { passive: true })

    // --- Computed items.
    const items = computed(() => {
      const itemEntries = Object.entries(props.items)

      // --- Map entries to objects.
      const itemObjects = itemEntries.map(([itemKey, item]) => {
        const key = get(item, props.itemKey, itemKey.toString())
        const value = get(item, props.itemValue, key)
        const label = get(item, props.itemLabel, key)
        const disabled = get(item, props.itemDisabled, false)
        const selected = Array.isArray(modelValue.value)
          ? modelValue.value.includes(value)
          : modelValue.value === value

        // --- Computed item props.
        return { item, key, value, selected, label, disabled }
      })

      // --- If value is undefined, push an empty item.
      if (modelValue.value === undefined) {
        itemObjects.push({
          item: undefined,
          key: 'undefined',
          value: undefined,
          selected: true,
          label: '',
          disabled: false,
        })
      }

      // --- Return items.
      return itemObjects
    })

    // --- Computed name and list.
    const inputName = computed(() => props.name ?? getCurrentInstance()?.uid.toString())
    const inputList = computed(() => `${inputName.value}-list`)

    // --- Computed input tagname.
    const inputIs = computed(() => {
      if (props.type === 'select') return 'select'
      if (props.type === 'textarea') return 'textarea'
      return props.as
    })

    // --- Computed component type.
    const inputType = computed(() => {
      if (props.type === 'list') return null
      if (props.type === 'select') return null
      if (props.type === 'textarea') return null
      return props.type
    })

    // --- Handler input change.
    const handleInput = (e: Event) => {
      const target = e.target as any

      // --- If input is a <select>, get selected item values.
      if (target.tagName === 'SELECT') {
        modelValue.value = target.multiple === true

          // --- If input is a <select multiple>, get selected item value.
          ? [...target.options]
            .filter(option => option.selected)
            .map(option => items.value.find(x => x.key === option.value)?.value)

          // --- If input is a <select>, get selected item value.
          : items.value.find(x => x.key === target.value)?.value
      }

      // --- If input is a <input/textarea>, get value.
      else { modelValue.value = target.value }

      // --- Emit input event.
      emit('input', modelValue.value)
    }

    // --- Expose for debugging.
    const slotProps = exposeToDevtool({
      modelValue,
      inputIs,
      inputType,
      inputName,
      inputList,
      items,
    })

    // --- Return virtual DOM node.
    return () => {
      // --- Get input props.
      const nodeProps = mergeProps(attrs, {
        'name': inputName.value,
        'type': inputType.value,
        'disabled': props.disabled || null,
        'readonly': props.readonly || null,
        'aria-disabled': props.disabled || null,
        'aria-readonly': props.readonly || null,
        'aria-busy': props.loading || null,
        'aria-required': props.required || null,
        'list': props.type === 'list' ? inputList.value : null,
        'onInput': handleInput,
      })

      // --- Create and return <input/textarea> node.
      if (props.type !== 'list' && props.type !== 'select')
        return h(inputIs.value, nodeProps)

      // --- Create <option> nodes.
      const nodeOptions = slots.options?.(slotProps) ?? items.value.map((item) => {
        const { key, label, disabled, selected } = item
        return h('option', omit({
          'value': key,
          'disabled': disabled || null,
          'selected': selected || null,
          'aria-disabled': disabled || null,
          'aria-selected': selected || null,
          'class': props.classOption || null,
        }, isNil), label)
      })

      // --- Create and return <input> and <datalist> nodes.
      if (props.type === 'list') {
        return [
          h('input', nodeProps),
          h('datalist', { id: inputList.value }, nodeOptions),
        ]
      }

      // --- Create and return <select> nodes.
      if (props.type === 'select') return h('select', nodeProps, nodeOptions)
    }
  },
})
