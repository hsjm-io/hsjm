import { defineComponent, h, nextTick, onMounted, PropType, ref, watch } from 'vue-demi'
import MilSymbol from 'milsymbol'

export const Nato = defineComponent({
  props: {
    as: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: 'span'
    },

    icon: {
      type: String,
      required: true,
    },
  },

  setup: (props, { slots }) => {
    const el = ref<HTMLElement | null>(null)
    
    const update = async() => {
      await nextTick()

      if (!el.value) return

      const svgData = new MilSymbol.Symbol(props.icon, { size: 24 }).asSVG()
      const svg = document.createElement('svg')
      svg.innerHTML = svgData
      el.value.textContent = ''
      el.value.appendChild(svg)
    }
    
    watch(
      () => props.icon,
      update,
      { flush: 'post' },
    )
    
    onMounted(update)

    return () => h(props.as, slots)
  }
})