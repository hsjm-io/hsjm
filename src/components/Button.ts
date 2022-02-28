import { defineComponent, resolveComponent, h, PropType } from 'vue-demi'
import { RouteLocationRaw } from 'vue-router'
import { useHtmlAttrs } from '~/composables'

export const Button = defineComponent({
  name: 'Button',
  props: {
    as: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: 'button'
    },

    // --- States
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,

    // --- Sizing
    width: [Number, String],
    height: [Number, String],
    minWidth: [Number, String],
    minHeight: [Number, String],
    maxWidth: [Number, String],
    maxHeight: [Number, String],
    size: [Number, String],
    minSize: [Number, String],
    maxSize: [Number, String],

    // --- Routing
    to: [String, Object] as PropType<string | RouteLocationRaw>,
    classActive: { type: String, default: '' },
    classActiveExact: { type: String, default: '' },
    replace: Boolean,
    newtab: Boolean,
  },

  setup: (props, { slots }) => {
    const { attributes, is } = useHtmlAttrs(props)
    const type = is !== is.toLowerCase() ? resolveComponent(is) : is
    // @ts-expect-error
    return () => h(type , attributes, slots)
  }
})
