import { useVModel } from '@vueuse/core'
import { computed, reactive } from 'vue-demi'
import { convertToUnit } from '~/utils'
// import { RouteLocationRaw } from 'vue-router'

export interface UseHtmlAttrsOptions {

  // --- Tag
  as: keyof HTMLElementTagNameMap,

  // --- States
  disabled?: boolean
  classDisabled?: string,
  readonly?: boolean
  loading?: boolean

  // --- Sizing
  width?: number | string
  height?: number | string
  minWidth?: number | string
  minHeight?: number | string
  maxWidth?: number | string
  maxHeight?: number | string
  size?: number | string
  minSize?: number | string
  maxSize?: number | string

  // --- Routing
  to?: string | Record<string, any> //RouteLocationRaw,
  classActive?: string
  classActiveExact?: string
  replace?: boolean
  newtab?: boolean
}

export const useHtmlAttrs = (options = { as: 'div' } as UseHtmlAttrsOptions) => {

  //--- Compute states variables.
  const disabledState = useVModel(options, 'disabled', undefined, {passive: true})
  const readonlyState = useVModel(options, 'readonly', undefined, {passive: true})
  const loadingState = useVModel(options, 'loading', undefined, {passive: true})

  // --- Compute routing variables.
  const isLink = computed(() => !!options.to)
  const isExternalLink = computed(() => isLink.value && typeof options.to === 'string' && !options.to?.startsWith('/'))
  const isInternalLink = computed(() => isLink.value && !isExternalLink.value)

  const is = computed(() => {
    if (isLink.value) return isInternalLink.value ? 'RouterLink' : 'a' 
    return options.as
  })

  //--- Compute element style.
  const style = reactive({
    width: convertToUnit(options.width) ?? convertToUnit(options.size),
    height: convertToUnit(options.height) ?? convertToUnit(options.size),
    minWidth: convertToUnit(options.minWidth) ?? convertToUnit(options.minSize),
    minHeight: convertToUnit(options.minHeight) ?? convertToUnit(options.minSize),
    maxWidth: convertToUnit(options.maxWidth) ?? convertToUnit(options.maxSize),
    maxHeight: convertToUnit(options.maxHeight) ?? convertToUnit(options.maxSize),
  })

  //--- Compute element attributes.
  const attributes = reactive({

    // --- Tag and style.
    style,

    // --- State.
    disabled: computed(() => disabledState.value || null),
    readonly: computed(() => readonlyState.value || null),
    loading: computed(() => loadingState.value || null),
    'aria-disabled': computed(() => disabledState.value || null),
    'aria-readonly': computed(() => readonlyState.value || null),
    'aria-busy': computed(() => loadingState.value || null),

    // --- Routing.
    ...(isLink.value ? {
      to: computed(() => isInternalLink.value && !options.newtab ? options.to : null),
      href: options.to,
      target: computed(() => options.newtab ? '_blank' : null),
      rel: computed(() => options.newtab ? 'noreferrer' : null),
      'active-class': computed(() => is.value === 'RouterLink' ? options.classActive : null),
      'exact-active-class': computed(() => is.value === 'RouterLink' ? options.classActiveExact : null),
    }: {})
  })

  //--- Return reactive properties.
  return reactive({
    is,
    attributes,
    disabledState,
    readonlyState,
    loadingState,
    isLink,
    isExternalLink,
    isInternalLink,
  })
}
