
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
import { useVModel } from '@vueuse/core'
import { PropType, TransitionProps, VNode, defineComponent, h, mergeProps, ref } from 'vue-demi'
import { MaybeArray, arrayify, isTruthy, pick, toCamelCase } from '@hsjm/shared'
import { UseListItemsOptions, useListItems, useOutsideEvent } from '../composables'
import { exposeToDevtool, wrapTransition } from '../utils'

export const InputList = /* @__PURE__ */ defineComponent({
  name: 'InputList',
  inheritAttrs: true,
  props: {
    multiple: Boolean,
    placeholder: String,
    searchable: Boolean,
    alwaysOpen: Boolean,

    openOn: {
      type: [String, Array] as PropType<MaybeArray<keyof HTMLElementEventMap>>,
      default: ['focus', 'click'],
    },

    closeOn: {
      type: [String, Array] as PropType<MaybeArray<`${keyof HTMLElementEventMap}${'' | '-outside'}`>>,
      default: ['focusin-outside', 'click-outside'],
    },

    // --- State.
    modelValue: {} as PropType<any>,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,

    // --- Transitions.
    transitionList: Object as PropType<TransitionProps>,
    transitionItems: Object as PropType<TransitionProps>,

    // --- List
    items: { type: [Array, Object] as PropType<UseListItemsOptions['items']>, default: () => ({}) },
    itemText: [String, Function] as PropType<UseListItemsOptions['itemText']>,
    itemValue: [String, Function] as PropType<UseListItemsOptions['itemValue']>,
    itemDisabled: [String, Function] as PropType<UseListItemsOptions['itemDisabled']>,
    itemSearch: [String, Function] as PropType<UseListItemsOptions['itemSearch']>,

    // --- Classes
    classItem: {} as PropType<any>,
    classSearch: {} as PropType<any>,
    classList: {} as PropType<any>,
    classListItem: {} as PropType<any>,
    classListBox: {} as PropType<any>,
  },
  emits: [
    'update:modelValue',
  ],
  setup: (props, { attrs, slots, emit }) => {
    // --- Initialize state.
    const modelValue = useVModel(props, 'modelValue', emit, { passive: true })
    const { items, itemsSelected } = useListItems(modelValue, props)
    const searchQuery = ref('')
    const searchKey = Symbol('search')
    const listOpen = ref(false)
    const listKey = Symbol('list')
    const close = () => listOpen.value = false
    const open = () => listOpen.value = true

    // --- Handle evebts outside of the element.
    const inputElement = ref<HTMLDivElement | VNode | undefined>()
    arrayify(props.closeOn)
      .filter(eventName => eventName.endsWith('-outside'))
      .forEach(eventName => useOutsideEvent(eventName.replace(/-outside$/, ''), close, inputElement))

    // --- Expose to Vue Devtools for debugging.
    const slotProps = exposeToDevtool({
      items,
      itemsSelected,
      listOpen,
      modelValue,
      searchQuery,
      inputElement,
    })

    // --- Create VNode of list and their items.
    const createVNodeList = () => {
      if (slots.list) return slots.list(slotProps)

      // --- Iterate over list items
      // --- Overwrite with item slot if provided.
      // --- Filter-out non visible items.
      // --- Default with li node.
      const vNodeListItems = items.value.map((item) => {
        if (slots['list-item']) return slots['list-item'](item)
        if (item.isVisible(searchQuery.value) === false) return null
        const selected = item.isSelected()
        return h('li',
          pick({
            'role': 'listitem',
            'disabled': item.disabled,
            'selected': selected,
            'aria-disabled': item.disabled,
            'aria-selected': selected,
            'class': props.classListItem,
            'onClick': item.toggle,
          }, isTruthy),
          slots.item?.(item) ?? item.text)
      })

      // --- Return list node.
      return h('ul', {
        key: listKey,
        role: 'list',
        class: props.classList,
      }, vNodeListItems)
    }

    // --- Create VNode of value items.
    return () => {
      // --- Iterate over values.
      const vNodeItems = itemsSelected.value.map(item => h(
        'span',
        pick({ key: item.value, class: props.classItem }, isTruthy),
        slots.item?.(item) ?? item.text,
      ))

      // --- Create automplete input if searchQueryable is enabled.
      const vNodeitemInput = props.searchable && h('input', pick({
        key: searchKey,
        type: 'text',
        tabindex: -1,
        placeholder: props.placeholder,
        class: props.classSearch,
        disabled: props.disabled,
        readonly: props.readonly,
        value: searchQuery.value,
        onInput: (event: InputEvent) => { searchQuery.value = (event.target as HTMLInputElement).value },
      }, isTruthy))

      // --- Build props
      const onOpenEvents = arrayify(props.openOn).map(eventName => [toCamelCase(`on-${eventName}`), open])
      const onCloseEvents = arrayify(props.closeOn).map(eventName => [toCamelCase(`on-${eventName}`), close])
      const inputEventHandlers = Object.fromEntries([...onOpenEvents, ...onCloseEvents])
      const inputProps = pick({ tabIndex: 1, ref: inputElement, ...inputEventHandlers }, isTruthy)

      // --- Return item group node.
      return h('div', mergeProps(attrs, inputProps), [
        wrapTransition([vNodeItems, vNodeitemInput], props.transitionItems),
        wrapTransition(listOpen.value && createVNodeList(), props.transitionList),
      ])
    }
  },
})
