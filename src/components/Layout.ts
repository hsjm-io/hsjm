import { defineComponent, ref, watch } from "vue"
import { useWindowScroll, useElementSize } from '@vueuse/core'

export const Layout = defineComponent({
    
    props: {
        width: Number,
        height: Number,
        scroll: Number,
    },

    setup(props, {attrs, emit}){

        //--- Get root element ref.
        const root = ref(null)

        //--- Watch for user scrolling.
        const { y: scroll } = useWindowScroll()
        if(props.scroll) watch(scroll, scroll => emit('update:scroll', scroll), {immediate: true})

        //--- Watch for nav height & width.
        const { height, width } = useElementSize(root)
        if(props.height) watch(height, height => emit('update:height', height), {immediate: true})
        if(props.width) watch(width, width => emit('update:width', width), {immediate: true})
        
        //--- Return reactive properties.
        return { root, scroll, height, width }
    }
})
