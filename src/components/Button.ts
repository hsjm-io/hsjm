import { defineComponent, h, PropType } from 'vue-demi'
import { RouteLocationRaw } from 'vue-router'
import { useHtmlAttrs } from '@hsjm/core'

export const Button = defineComponent({
  name: 'Button',
  props: {
    as: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: 'button'
    },
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    to: [String, Object] as PropType<string | RouteLocationRaw>,
    classActive: { type: String, default: '' },
    classActiveExact: { type: String, default: '' },
    replace: Boolean,
    newtab: Boolean,
  },

  setup: (props, { slots }) => {
    const { attributes, type } = useHtmlAttrs(props)
    return () => h(type as any, attributes, slots)
  }
})
