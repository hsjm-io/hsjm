//--- Import dependencies.
import { ref, computed } from 'vue-demi'
import { whenever, noop } from '@vueuse/core'
import {
  useLink as useVueRouterLink,
  UseLinkOptions as UseVueRouterLinkOptions
} from 'vue-router'

export type UseLinkOptions = UseVueRouterLinkOptions & {
    tag: string, 
    custom: boolean,
    replace: boolean,
    activeClass: string,
    exactActiveClass: string,
    useExactActive: boolean,
}

export const useLink = (options: Readonly<UseLinkOptions>) => {

    //--- Define reactive variables.
    let navigate = ref(noop)
    let isActive = ref(false)
    let isExactActive = ref(false)
    let href = computed(() => options.to)
    let isLink = computed(() => !!options.to)
    let isExternalLink = computed(() => isLink.value && typeof options.to === 'string' && !options.to?.startsWith('/'))
    let isInternalLink = computed(() => isLink.value && !isExternalLink.value)

    //--- Overwrite state when the button is an internal link.
    whenever(isInternalLink, () => {
        const link = useVueRouterLink(options)
        navigate.value = link.navigate
        isActive = link.isActive
        isExactActive = link.isExactActive
        href = link.href
    }, {immediate: true})

    //--- Define computed classes array.
    const classes = computed(() => {

        //--- Dont use these classes if we dont need them.
        if(!isInternalLink.value) return {}

        //--- Return classes that depends on the router state.
        return {
            [options.activeClass as string]: options.useExactActive ? isActive.value : isExactActive.value,
            [options.exactActiveClass as string]: options.useExactActive ? isExactActive.value : false,
        }
    })

    //--- Define computed classes array.
    const attributes = computed(() => {

        //--- Dont use these attributtes if we dont need them.
        if(!isLink.value) return {}

        //--- Return classes that depends on the router state.
        return {
          is: 'a',
          href: href.value,
          class: classes.value,
          onClick: [navigate]
        }
    })

    //--- Return reactive properties.
    return {
        navigate,
        isLink,
        isExternalLink,
        isInternalLink,
        isActive,
        isExactActive,
        classes,
        attributes,
    }
}
