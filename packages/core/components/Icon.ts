import { PropType, defineComponent, h, mergeProps, toRefs } from 'vue-demi'
import { IconifyIconCustomisations } from '@iconify/iconify'
import { exposeToDevtool, useIconify } from '../composables'

export const Icon = defineComponent({
  name: 'Icon',
  props: {
    icon: { type: String, required: true },
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'span' },
    options: { type: Object as PropType<IconifyIconCustomisations>, default: {} },
  },
  setup: (properties, { attrs }) => {
    // --- Generate and expose the icon's SVG.
    const { as, icon, options } = toRefs(properties)
    const svg = useIconify(icon, options)
    exposeToDevtool({ svg })

    // --- Render the VNode.
    return () => h(as.value, mergeProps(attrs, {
      'role': 'img',
      'aria-labelledby': icon.value,
      'aria-hidden': 'true',
      'innerHTML': svg.value,
    }))
  },
})
