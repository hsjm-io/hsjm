import { PropType, defineComponent, h } from 'vue-demi'
import { IconifyIconCustomisations } from '@iconify/iconify'
import { useIconify } from './useIconify'

export const Icon = defineComponent({
  name: 'Icon',

  props: {
    icon: { type: String, required: true },
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'span' },
    options: { type: Object as PropType<IconifyIconCustomisations>, default: {} },
  },

  setup: async(properties, { attrs }) => {
    // --- Generate the icon.
    const svg = useIconify(properties.icon, properties.options)
    await svg.ready

    // --- Render the VNode.
    return () => h(properties.as, {
      'role': 'img',
      'aria-labelledby': properties.icon,
      'aria-hidden': 'true',
      'innerHTML': svg.value,
      ...attrs,
    })
  },
})
