import { tryOnMounted } from '@vueuse/shared'
import { PropType, computed, defineComponent, h, mergeProps } from 'vue-demi'
import { SymbolOptions } from 'milsymbol'
import { isNode } from '@hsjm/shared'
import { useMilsymbol } from '../composables'
import { exposeToDevtool } from '../utils'

export const Milsymbol = /* @__PURE__ */ defineComponent({
  name: 'Milsymbol',
  props: {
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'span' },
    sidc: { type: String, required: true },
    options: { type: Object as PropType<SymbolOptions>, default: {} },
    prerender: { type: Boolean, default: true },
  },
  setup: (props, { attrs }) => {
    // --- Generate and expose the symbol's SVG.
    const sidc = computed(() => props.sidc)
    const { svg, update } = useMilsymbol(sidc, props.options)

    // --- Expose to Vue Devtools for debugging.
    exposeToDevtool({ svg })

    // --- Render the VNode.
    const functionalComponent = () => h(props.as, mergeProps(attrs, {
      'role': 'img',
      'aria-labelledby': sidc.value,
      'aria-hidden': 'true',
      'innerHTML': svg.value,
    }))

    // --- If prerendering, await the icon's SVG.
    if (props.prerender && isNode)
      return update().then(() => functionalComponent)

    // --- Otherwise return the functional component directly.
    tryOnMounted(update)
    return functionalComponent
  },
})
