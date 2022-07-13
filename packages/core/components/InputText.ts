/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
import { PropType, computed, defineComponent, getCurrentInstance, h, mergeProps } from 'vue-demi'
import { isTruthy, pick } from '@hsjm/shared'
import { useVModel } from '@vueuse/core'
import { UseListItemsOptions, useListItems } from '../composables'
import { exposeToDevtool } from '../utils'

export const InputText = /* @__PURE__ */ defineComponent({
  name: 'InputText',
  inheritAttrs: true,
  props: {
    // --- Options.
    type: { type: String as PropType<HTMLInputElement['type'] | 'select' | 'list'>, default: 'text' },
    autocomplete: String as PropType<HTMLInputElement['autocomplete']>,
    name: String,
    required: Boolean,
    multiple: Boolean,

    // --- State
    modelValue: {} as PropType<any>,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,

    // --- List
    items: { type: [Array, Object] as PropType<UseListItemsOptions['items']>, default: () => ({}) },
    itemText: [String, Function] as PropType<UseListItemsOptions['itemText']>,
    itemValue: [String, Function] as PropType<UseListItemsOptions['itemValue']>,
    itemDisabled: [String, Function] as PropType<UseListItemsOptions['itemDisabled']>,

    // --- Classes
    classOption: String,
  },
  emits: [
    'update:modelValue',
  ],
  setup: (props, { attrs, slots, emit }) => {
    // --- Initialize two-way bindings and items.
    const modelValue = useVModel(props, 'modelValue', emit, { passive: true })
    const { items } = useListItems(modelValue, props)

    // --- Computed input tagname.
    const is = computed(() => {
      switch (props.type) {
        case 'select': return 'select'
        case 'textarea': return 'textarea'
        default: return 'input'
      }
    })

    // --- Computed component type.
    const type = computed(() => {
      switch (props.type) {
        case 'list': return null
        case 'select': return null
        case 'textarea': return null
        default: return props.type
      }
    })

    // --- Expose to Vue Devtools for debugging.
    const slotProps = exposeToDevtool({ is, type, items, modelValue })

    // --- Handler input change.
    const handleInput = (e: Event) => {
      const target = e.target as any

      // --- If input is a <select>, get selected item values.
      modelValue.value = target.tagName === 'SELECT' && target.multiple === true
        ? [...target.options].filter(option => option.selected).map(option => option.value)
        : target.value
    }

    // --- Return virtual DOM node.
    return () => {
      // --- Get input props.
      const nodeProps = mergeProps(attrs, {
        'name': props.name,
        'type': type.value,
        'disabled': props.disabled || null,
        'readonly': props.readonly || null,
        'aria-disabled': props.disabled || null,
        'aria-readonly': props.readonly || null,
        'aria-busy': props.loading || null,
        'aria-required': props.required || null,
        'multiple': props.multiple || null,
        'onInput': handleInput,
      })

      // --- Create and return <input/textarea> node.
      if (props.type !== 'list' && props.type !== 'select')
        return h(is.value, nodeProps)

      // --- Create <option> nodes.
      const nodeOptions = slots.options?.(slotProps) ?? items.value.map((item) => {
        // --- Overwrite with option slot if provided.
        if (slots.option) return slots.option(item)

        // --- Default with option node.
        const selected = item.isSelected()
        return h('option', pick({
          'value': item.value,
          'disabled': item.disabled || null,
          'selected': selected || null,
          'aria-disabled': item.disabled || null,
          'aria-selected': selected || null,
          'class': props.classOption || null,
        }, isTruthy), item.text)
      })

      // --- Create and return <input> and <datalist> nodes.
      if (props.type === 'list') {
        const inputName = props.name ?? getCurrentInstance()?.uid.toString()
        const listName = `${inputName}-list`
        return [
          h('input', { ...nodeProps, list: listName }),
          h('datalist', { id: listName }, nodeOptions),
        ]
      }

      // --- Create and return <select> nodes.
      if (props.type === 'select')
        return h('select', nodeProps, nodeOptions)
    }
  },
})
