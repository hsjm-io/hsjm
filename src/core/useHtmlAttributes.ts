import { useVModel } from '@vueuse/core'
import { computed, reactive, resolveComponent, toRefs } from 'vue-demi'

export interface UseHtmlAttributesOptions {
  as: keyof HTMLElementTagNameMap
  disabled?: boolean
  classDisabled?: string
  readonly?: boolean
  loading?: boolean
  to?: string | Record<string, any>
  classActive?: string
  classActiveExact?: string
  replace?: boolean
  newtab?: boolean
}

export const useHtmlAttributes = (options = {} as UseHtmlAttributesOptions) => {
  const { as = 'div' } = toRefs(options)

  // --- Compute states variables.
  const disabledState = useVModel(options, 'disabled', undefined, { passive: true })
  const readonlyState = useVModel(options, 'readonly', undefined, { passive: true })
  const loadingState = useVModel(options, 'loading', undefined, { passive: true })

  // --- Compute routing variables.
  const isLink = computed(() => !!options.to)
  const isExternalLink = computed(() => isLink.value && typeof options.to === 'string' && !options.to?.startsWith('/'))
  const isInternalLink = computed(() => isLink.value && !isExternalLink.value)

  // --- Compute component type.
  const type = computed(() => {
    if (isLink.value) return isInternalLink.value ? resolveComponent('RouterLink') : 'a'
    return as
  })

  // --- Compute element attributes.
  const attributes = reactive({

    // --- State.
    'disabled': computed(() => disabledState.value),
    'readonly': computed(() => readonlyState.value),
    'loading': computed(() => loadingState.value),
    'aria-disabled': computed(() => disabledState.value),
    'aria-readonly': computed(() => readonlyState.value),
    'aria-busy': computed(() => loadingState.value),

    // --- Routing.
    ...(isLink.value
      ? {
        'to': computed(() => (isInternalLink.value && !options.newtab ? options.to : undefined)),
        'href': options.to,
        'target': computed(() => (options.newtab ? '_blank' : undefined)),
        'rel': computed(() => (options.newtab ? 'noreferrer' : undefined)),
        'active-class': computed(() => (typeof type.value !== 'string' ? options.classActive : undefined)),
        'exact-active-class': computed(() => (typeof type.value !== 'string' ? options.classActiveExact : undefined)),
      }
      : {}),
  })

  // --- Return reactive properties.
  return reactive({
    type,
    attributes,
    disabledState,
    readonlyState,
    loadingState,
    isLink,
    isExternalLink,
    isInternalLink,
  })
}
