import { PropType, defineAsyncComponent, defineComponent, h, nextTick, onMounted, ref, watch } from 'vue-demi'
import { SymbolOptions } from 'milsymbol'
import { templateRef } from '@vueuse/core'

export const MilSymbol = defineAsyncComponent(async() => {
  const MilSymbol = await import('milsymbol')

  return defineComponent({
    name: 'Nato',
    props: {
      as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'span' },
      symbol: { type: [String, Object] as PropType<string | SymbolOptions>, required: true },
    },

    setup: (props) => {
      const element = templateRef('el')
      const sidc = ref<string>()

      // --- Create and append the icon in the template.
      const update = async() => {
        await nextTick()

        // --- Abort if the element was not rendered.
        if (!element.value) return

        // --- Generate the symbol.
        const symbol = new MilSymbol.Symbol(props.symbol, { size: 24 })
        sidc.value = symbol.getOptions().sidc

        // --- If successful, append it in the template.
        const svgData = symbol.asSVG()
        const svg = document.createElement('svg')
        svg.innerHTML = svgData
        element.value.textContent = ''
        element.value.append(svg)
      }

      // --- Update symbol on init or on `symbol` change.
      onMounted(update)
      watch(() => props.symbol, update, { flush: 'post', deep: true })

      return () => h(props.as, {
        'ref': 'el',
        'role': 'img',
        'aria-labelledby': sidc.value,
        'aria-hidden': 'true',
      })
    },
  })
})
