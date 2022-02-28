import { defineComponent, h, nextTick, onMounted, PropType, ref, watch } from 'vue-demi'
import Iconify from '@purge-icons/generated'

export const Icon = defineComponent({
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

      const svg = Iconify.renderSVG(props.icon, {}) 

      if (svg) {
        el.value.textContent = ''
        el.value.appendChild(svg)
      }

      else {
        const span = document.createElement('span')
        span.className = 'iconify'
        span.dataset.icon = props.icon
        el.value.textContent = ''
        el.value.appendChild(span)
      }
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
