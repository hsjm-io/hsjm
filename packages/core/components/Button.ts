/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
import { useVModel } from '@vueuse/core'
import { PropType, computed, defineComponent, h, mergeProps, resolveComponent } from 'vue-demi'
import { RouteLocationRaw } from 'vue-router'
import { debounce, noop, throttle } from '@hsjm/shared'
import { exposeToDevtool } from '../composables'

export const Button = /* @__PURE__ */ defineComponent({
  name: 'HsjmButton',
  inheritAttrs: false,
  props: {
    as: String as PropType<keyof HTMLElementTagNameMap>,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    error: Object as PropType<any>,
    to: [String, Object] as PropType<RouteLocationRaw>,
    replace: Boolean,
    newtab: Boolean,
    classActive: {} as PropType<unknown>,
    classActiveExact: {} as PropType<unknown>,
    onClick: { type: Function, default: noop },
    debounce: { type: Number, default: 0 },
    throttle: { type: Number, default: 0 },
  },
  emits: [
    'update:disabled',
    'update:readonly',
    'update:loading',
    'update:error',
  ],
  setup: (properties, { attrs, emit, slots }) => {
    // --- Compute states variables.
    const modelDisabled = useVModel(properties, 'disabled', emit, { passive: true })
    const modelReadonly = useVModel(properties, 'readonly', emit, { passive: true })
    const modelLoading = useVModel(properties, 'loading', emit, { passive: true })
    const modelError = useVModel(properties, 'error', emit, { passive: true })

    // --- Compute routing variables.
    const isLink = computed<boolean>(() => properties.to !== undefined)
    const isExternalLink = computed(() => isLink.value && typeof properties.to === 'string' && !properties.to?.startsWith('/'))
    const isInternalLink = computed(() => isLink.value && !isExternalLink.value)
    const linkTarget = computed(() => (isLink.value && properties.newtab ? '_blank' : attrs.target as string))
    const linkRel = computed(() => (isExternalLink.value && properties.newtab ? 'noreferrer' : attrs.rel as string))
    const linkActiveClass = computed(() => (isInternalLink.value ? properties.classActive : undefined))
    const linkExactActiveClass = computed(() => (isInternalLink.value ? properties.classActiveExact : undefined))

    // --- Compute component type.
    const is = computed(() => {
      if (isInternalLink.value) return 'RouterLink'
      if (isExternalLink.value) return 'a'
      return properties.as ?? 'button'
    })

    // --- Wrap function to handle loading state & catch error.
    const onClickWrapped = computed(() => {
      const onClick = () => {
        const result = properties.onClick?.()
        if (result instanceof Promise) {
          modelLoading.value = true
          result
            .catch(error => modelError.value = error)
            .finally(() => modelLoading.value = false)
        }
      }

      // --- Return wrapped function.
      if (properties.throttle > 0) return throttle(onClick, properties.throttle)
      if (properties.debounce > 0) return debounce(onClick, properties.debounce)
      return onClick
    })

    exposeToDevtool({
      is,
      isExternalLink,
      isInternalLink,
      isLink,
      linkActiveClass,
      linkExactActiveClass,
      linkRel,
      linkTarget,
      modelDisabled,
      modelError,
      modelLoading,
      modelReadonly,
      onClickWrapped,
    })

    // --- Return virtual DOM node.
    return () => h(

      // --- VNode type.
      /^[A-Z]/.test(is.value)
        ? resolveComponent(is.value) as any
        : is.value,

      // --- VNode props.
      mergeProps(attrs, {
        'disabled': modelDisabled.value || null,
        'readonly': modelReadonly.value || null,
        'aria-disabled': modelDisabled.value || null,
        'aria-readonly': modelReadonly.value || null,
        'aria-busy': modelLoading.value || null,
        'to': isInternalLink.value ? properties.to : undefined,
        'href': isLink.value ? properties.to : undefined,
        'target': linkTarget.value,
        'rel': linkRel.value,
        'active-class': linkActiveClass.value,
        'exact-active-class': linkExactActiveClass.value,
        'onClick': onClickWrapped.value,
      }),

      // --- VNode slots.
      slots,
    )
  },
})
