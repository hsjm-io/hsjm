import { IconifyIconCustomisations } from '@purge-icons/generated'
import { defineComponent, h, PropType } from 'vue-demi'
import { useIconify } from '~/composables'

export const Icon = defineComponent({
  name: 'Icon',

  props: {
    icon: { type: String, required: true },
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'span' },
    options: { type: Object as PropType<IconifyIconCustomisations>, default: {} }
  },

  setup: async (props) => {
    
    // --- Generate the icon.
    const svg = useIconify(props.icon, props.options)
    await svg.ready

    // --- Render the VNode.
    return () => h(props.as, {
      role: 'img',
      'aria-labelledby': props.icon,
      'aria-hidden': 'true',
      innerHTML: svg.value
    })
  },
})
