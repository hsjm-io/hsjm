import { isNode } from '@hsjm/shared'
import { PropType, computed, defineComponent, h, mergeProps } from 'vue-demi'
import { IconifyIconCustomisations } from '@iconify/iconify'
import { useIconify } from '../composables'
import { exposeToDevtool } from '../utils'

export const Icon = /* @__PURE__ */ defineComponent({
  name: 'Icon',
  props: {
    icon: { type: String, required: true },
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'span' },
    options: Object as PropType<IconifyIconCustomisations>,
    prerender: { type: Boolean, default: true },
  },
  setup: (props, { attrs }) => {
    // --- Generate and expose the icon's SVG.
    const icon = computed(() => props.icon)
    const { svg, update } = useIconify(icon, props.options)

    // --- Expose to Vue Devtools for debugging.
    exposeToDevtool({ icon, svg })

    // --- Render the VNode.
    const functionalComponent = () => h(props.as, mergeProps(attrs, {
      'role': 'img',
      'aria-labelledby': icon.value,
      'aria-hidden': 'true',
      'innerHTML': svg.value,
    }))

    // --- If prerendering, await the icon's SVG.
    if (props.prerender && isNode)
      return update().then(() => functionalComponent)

    // --- Otherwise return the functional component directly.
    update()
    return functionalComponent
  },
})
