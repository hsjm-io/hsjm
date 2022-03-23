import { defineComponent, ref, watch } from 'vue-demi'
import { useElementSize, useWindowScroll } from '@vueuse/core'

export const Layout = defineComponent({

  props: {
    width: Number,
    height: Number,
    scroll: Number,
  },

  setup(properties, { emit }) {
    // --- Get root element ref.
    const root = ref()

    // --- Watch for user scrolling.
    const { y: scroll } = useWindowScroll()
    if (properties.scroll) watch(scroll, scroll => emit('update:scroll', scroll), { immediate: true })

    // --- Watch for nav height & width.
    const { height, width } = useElementSize(root)
    if (properties.height) watch(height, height => emit('update:height', height), { immediate: true })
    if (properties.width) watch(width, width => emit('update:width', width), { immediate: true })

    // --- Return reactive properties.
    return { root, scroll, height, width }
  },
})
