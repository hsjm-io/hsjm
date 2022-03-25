import { PropType, defineComponent, h } from 'vue-demi'
import { RouteLocationRaw } from 'vue-router'
import { useButton } from '@hsjm/core'

export const Button = defineComponent({
  name: 'Button',

  props: {
    as: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: 'button',
    },
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    to: [String, Object] as PropType<RouteLocationRaw | string>,
    classActive: { type: String, default: '' },
    classActiveExact: { type: String, default: '' },
    replace: Boolean,
    newtab: Boolean,
  },

  setup: (properties, { slots }) => {
    const { attributes, type } = useButton(properties)
    return () => h(type as any, attributes, slots)
  },
})
