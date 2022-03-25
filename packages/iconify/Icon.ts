import { PropType, defineComponent, h, toRefs } from 'vue-demi'
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
    // --- Destructure props.
    const { as, icon, options } = toRefs(properties)

    // --- Generate the icon.
    const svg = useIconify(icon, options)
    await svg.ready

    // --- Render the VNode.
    return () => h(as, {
      'role': 'img',
      'aria-labelledby': icon,
      'aria-hidden': 'true',
      'innerHTML': svg.value,
      ...attrs,
    })
  },
})
