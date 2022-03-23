import { defineAsyncComponent, defineComponent, h, nextTick, onMounted, PropType, ref, watch } from 'vue-demi'
import { SymbolOptions } from 'milsymbol'
import { templateRef } from '@vueuse/core'

export const Nato = defineAsyncComponent(async () => {
  const MilSymbol = await import('milsymbol')

  return defineComponent({
    name: 'Nato',
    props: {
      as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'span' },
      symbol: { type: [String, Object] as PropType<string | SymbolOptions>, required: true }
    },

    setup: (props) => {
      const el = templateRef('el')
      const sidc = ref<string | null>(null)
      
      // --- Create and append the icon in the template.
      const update = async () => {
        await nextTick()

        // --- Abort if the element was not rendered.
        if (!el.value) return

        // --- Generate the symbol.
        const symbol = new MilSymbol.Symbol(props.symbol, { size: 24 })
        sidc.value = symbol.getOptions().sidc ?? null

        // --- If successful, append it in the template.
        const svgData = symbol.asSVG()
        const svg = document.createElement('svg')
        svg.innerHTML = svgData
        el.value.textContent = ''
        el.value.appendChild(svg)
      }

      // --- Update symbol on init or on `symbol` change.
      onMounted(update)
      watch(() => props.symbol, update, { flush: 'post', deep: true })

      // @ts-ignore --- Render the VNode.
      return () => h(props.as, {
        ref: 'el',
        role: 'img',
        'aria-labelledby': sidc.value,
        'aria-hidden': 'true'
      })
    }
  })
})