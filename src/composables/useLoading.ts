import { computed } from 'vue-demi'
import { useVModel } from '@vueuse/core'

//--- Define and expose `props` object.
export interface UseLoadingOptions {
    loading: boolean,
    loadingClass: string,
}

//--- Compose.
export const useLoading = (options: Readonly<UseLoadingOptions>) => {

    //--- Define reactive variables.
    const loading = useVModel(options, 'loading', undefined, {passive: true})

    //--- Compute element attributes.
    const $attrs = computed(() => ({
        class: {
          [options.loadingClass ?? 'loading']: loading.value
        },
        'aria-busy': loading.value
    }))

    //--- Return reactive properties.
  return { $attrs, loading }
}
