/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
import { PropType, computed, defineComponent, h, mergeProps } from 'vue-demi'
import { useVModel } from '@vueuse/core'
import { RouteLocationRaw } from 'vue-router'
import { debounce, noop, throttle } from '@hsjm/shared'
import { IconifyIconCustomisations } from '@iconify/iconify'
import { exposeToDevtool, resolveComponentType } from '../composables'
import { Icon } from './Icon'

export const Button = /* @__PURE__ */ defineComponent({
  name: 'Button',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<keyof HTMLElementTagNameMap>, default: 'button' },
    label: String,

    // --- State.
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    error: String,

    // --- Icon
    icon: String,
    iconAppend: String,
    iconPrepend: String,
    iconOptions: Object as PropType<IconifyIconCustomisations>,

    // --- Routing
    to: [String, Object] as PropType<RouteLocationRaw>,
    replace: Boolean,
    newtab: Boolean,

    // --- Interaction
    onClick: { type: Function, default: noop },
    debounce: { type: Number, default: 0 },
    throttle: { type: Number, default: 0 },

    // --- Classes.
    classActive: {} as PropType<unknown>,
    classActiveExact: {} as PropType<unknown>,
  },
  emits: [
    'update:disabled',
    'update:readonly',
    'update:loading',
    'update:error',
  ],
  setup: (props, { attrs, emit, slots }) => {
    // --- Compute states variables.
    const modelDisabled = useVModel(props, 'disabled', emit, { passive: true })
    const modelReadonly = useVModel(props, 'readonly', emit, { passive: true })
    const modelLoading = useVModel(props, 'loading', emit, { passive: true })
    const modelError = useVModel(props, 'error', emit, { passive: true })

    // --- Compute routing variables.
    const isLink = computed(() => props.to !== undefined)
    const isExternalLink = computed(() => isLink.value && typeof props.to === 'string' && !props.to?.startsWith('/'))
    const isInternalLink = computed(() => isLink.value && !isExternalLink.value)

    // --- Compute component type.
    const is = computed(() => {
      if (isInternalLink.value) return 'RouterLink'
      if (isExternalLink.value) return 'a'
      return props.as
    })

    // --- Wrap function to handle loading state & catch error.
    const onClickWrapped = computed(() => {
      const onClick = () => {
        const result = props.onClick()
        if (result instanceof Promise) {
          modelLoading.value = true
          result
            .catch(error => modelError.value = error)
            .finally(() => modelLoading.value = false)
        }
      }

      // --- Return wrapped function.
      if (props.throttle > 0) return throttle(onClick, props.throttle)
      if (props.debounce > 0) return debounce(onClick, props.debounce)
      return onClick
    })

    // --- Expose for debugging.
    const slotProps = exposeToDevtool({
      is,
      isExternalLink,
      isInternalLink,
      isLink,
      modelDisabled,
      modelError,
      modelLoading,
      modelReadonly,
      onClickWrapped,
    })

    // --- Declare render icon method.
    const createIconVNode = (icon?: string) => (icon ? h(Icon, { icon, options: props.iconOptions }) : undefined)

    // --- Return virtual DOM node.
    return () => h(

      // --- VNode type.
      resolveComponentType<any>(is.value),

      // --- VNode props.
      mergeProps(attrs, {
        'disabled': modelDisabled.value || null,
        'readonly': modelReadonly.value || null,
        'aria-disabled': modelDisabled.value || null,
        'aria-readonly': modelReadonly.value || null,
        'aria-busy': modelLoading.value || null,
        'aria-labelledby': props.label,
        'onClick': onClickWrapped.value,

        ...(isInternalLink.value
          ? {
            'to': props.to,
            'active-class': props.classActive,
            'exact-active-class': props.classActiveExact,
          }
          : {}),

        ...(isExternalLink.value
          ? {
            href: props.to,
            rel: props.newtab ? 'noreferrer' : attrs.rel,
          }
          : {}),

        ...(isLink.value
          ? {
            target: props.newtab ? '_blank' : attrs.target,
          }
          : {}),
      }),

      // --- VNode slots.
      {
        default: () => [
          slots.prepend?.(slotProps) ?? createIconVNode(props.icon ?? props.iconPrepend),
          slots.default?.(slotProps) ?? (props.label ? h('span', props.label) : undefined),
          slots.append?.(slotProps) ?? createIconVNode(props.iconAppend),
        ],
      },
    )
  },
})
