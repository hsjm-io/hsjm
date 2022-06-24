import { PropType, defineComponent, h, mergeProps, toRefs } from 'vue-demi'
import { SymbolOptions } from 'milsymbol'
import { exposeToDevtool, useMilsymbol } from '../composables'

export const Milsymbol = /* @__PURE__ */ defineComponent({
  name: 'Milsymbol',
  props: {
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'span' },
    sidc: { type: String, required: true },
    options: { type: Object as PropType<SymbolOptions>, default: {} },
  },
  setup: (props, { attrs }) => {
    // --- Generate and expose the symbol's SVG.
    const { as, sidc, options } = toRefs(props)
    const svg = useMilsymbol(sidc, options)
    exposeToDevtool({ svg })

    // --- Render the VNode.
    return () => h(as.value, mergeProps(attrs, {
      'role': 'img',
      'aria-labelledby': sidc.value,
      'aria-hidden': 'true',
      'innerHTML': svg.value,
    }))
  },
})
