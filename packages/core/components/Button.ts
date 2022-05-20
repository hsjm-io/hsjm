/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
import { useVModel } from '@vueuse/core'
import { PropType, computed, defineComponent, h, resolveComponent, toRefs } from 'vue-demi'
import { RouteLocationRaw } from 'vue-router'
import { debounce, noop, throttle } from '@hsjm/shared'

export const Button = defineComponent({
  name: 'Button',
  props: {
    as: String as PropType<keyof HTMLElementTagNameMap>,

    // --- State.
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    error: Object as PropType<any>,

    // --- Routing.
    to: [String, Object] as PropType<RouteLocationRaw | string>,
    replace: Boolean,
    newtab: Boolean,

    // --- Classes.
    classActive: Object as PropType<any>,
    classActiveExact: Object as PropType<any>,

    // --- Events.
    onClick: Function,
    debounce: Number,
    throttle: Number,
  },
  setup: (properties, { slots, attrs }) => {
    // --- Destructure props.
    const {
      as,
      to,
      newtab,
      classActive,
      classActiveExact,
      onClick,
      throttle: throttleDelay,
      debounce: debounceDelay,
    } = toRefs(properties)

    // --- Compute states variables.
    const modelDisabled = useVModel(properties, 'disabled', undefined, { passive: true })
    const modelReadonly = useVModel(properties, 'readonly', undefined, { passive: true })
    const modelLoading = useVModel(properties, 'loading', undefined, { passive: true })
    const modelError = useVModel(properties, 'error', undefined, { passive: true })

    // --- Compute routing variables.
    const isLink = computed<boolean>(() => to.value === true)
    const isExternalLink = computed(() => isLink.value && typeof to.value === 'string' && !to.value?.startsWith('/'))
    const isInternalLink = computed(() => isLink.value && !isExternalLink.value)
    const linkTo = computed(() => (isLink.value && isInternalLink.value && !newtab.value ? to.value : undefined))
    const linkTarget = computed(() => (isLink.value && newtab.value ? '_blank' : attrs.target as string))
    const linkRel = computed(() => (isExternalLink.value && newtab.value ? 'noreferrer' : attrs.rel as string))
    const linkActiveClass = computed(() => (isInternalLink.value ? classActive.value : undefined))
    const linkExactActiveClass = computed(() => (isInternalLink.value ? classActiveExact.value : undefined))

    // --- Compute component type.
    const is = computed(() => {
      if (as.value) return as.value
      if (isInternalLink.value) return resolveComponent('RouterLink')
      if (isExternalLink.value) return 'a'
      return 'button'
    })

    // --- Wrap `onClick`.
    const onClickWrapped = computed(() => {
      // --- Make sure `onClick` is a function.
      const onClickValue = onClick.value
      if (typeof onClickValue !== 'function') return noop

      // --- Wrap function to trash loading state & catch error.
      const callback = () => {
        const result = onClickValue()
        if (result instanceof Promise) {
          modelLoading.value = true
          result
            .catch(error => modelError.value = error)
            .finally(() => modelLoading.value = false)
        }
      }

      // --- Return wrapped function.
      if (throttleDelay.value) return throttle(callback, throttleDelay.value)
      if (debounceDelay.value) return debounce(callback, debounceDelay.value)
      return callback
    })

    // --- Return virtual DOM node.
    return () => h(is, {
      // --- State.
      'disabled': modelDisabled.value ?? null,
      'readonly': modelReadonly.value ?? null,

      // --- Accessibility.
      'aria-disabled': modelDisabled.value ?? null,
      'aria-readonly': modelReadonly.value ?? null,
      'aria-busy': modelLoading.value ?? null,

      // --- Routing.
      'to': linkTo,
      'target': linkTarget,
      'rel': linkRel,
      'active-class': linkActiveClass,
      'exact-active-class': linkExactActiveClass,

      // --- Events.
      'onClick': onClickWrapped,
    }, slots)
  },
})
