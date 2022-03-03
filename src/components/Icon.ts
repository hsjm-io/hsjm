import { templateRef } from '@vueuse/core'
import { defineComponent, h, nextTick, onMounted, PropType, watch } from 'vue-demi'
import Iconify, { IconifyIconCustomisations } from '@iconify/iconify'

export const Icon = defineComponent({
  name: 'Icon',

  props: {
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'span' },
    icon: { type: String, required: true },
    options: { type: Object as PropType<IconifyIconCustomisations>, default: {} }
  },

  setup: (props) => {
    const el = templateRef('el')

    // --- Create and append the icon in the template.
    const update = async () => {
      await nextTick()

      // --- Abort if the element was not rendered.
      if (!el.value) return

      // --- Generate the icon as SVG.
      const svg = Iconify.renderSVG(props.icon, props.options)

      // --- If successful, append it in the template.
      if (svg) {
        el.value.textContent = ''
        el.value.appendChild(svg)
      }
    }

    // --- Generate icon on init or on `icon` change.
    onMounted(update)
    watch(() => [props.icon, props.options], update, { flush: 'post', deep: true })

    // @ts-ignore --- Render the VNode.
    return () => h(props.as, {
      ref: 'el',
      role: 'img',
      'aria-labelledby': props.icon,
      'aria-hidden': 'true'
    })
  },
})
