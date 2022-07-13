/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
import { PropType, computed, defineComponent, h, mergeProps, resolveComponent } from 'vue-demi'
import { useVModel } from '@vueuse/core'
import { RouteLocationRaw } from 'vue-router'
import { debounce, noop, throttle } from '@hsjm/shared'
import { IconifyIconCustomisations } from '@iconify/iconify'
import { exposeToDevtool, resolveComponentType } from '../utils'
import { Icon } from './Icon'

export const Button = /* @__PURE__ */ defineComponent({
  name: 'Button',
  inheritAttrs: false,
  props: {
    // --- Options.
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
    classIcon: {} as PropType<any>,
  },
  emits: [
    'update:disabled',
    'update:readonly',
    'update:loading',
    'update:error',
  ],
  setup: (props, { attrs, emit, slots }) => {
    // --- Compute states variables.
    const modelLoading = useVModel(props, 'loading', emit, { passive: true })
    const modelError = useVModel(props, 'error', emit, { passive: true })

    // --- Compute routing variables.
    const isLink = computed(() => props.to !== undefined)
    const isExternalLink = computed(() => isLink.value && typeof props.to === 'string' && !props.to?.startsWith('/'))
    const isInternalLink = computed(() => isLink.value && !isExternalLink.value)

    // --- Compute component type.
    const is = computed(() => {
      if (isInternalLink.value) return resolveComponent('RouterLink')
      if (isExternalLink.value) return 'a'
      return resolveComponentType<any>(props.as)
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

    // --- Expose to Vue Devtools for debugging.
    const slotProps = exposeToDevtool({ is, isExternalLink, isInternalLink, isLink, modelError, modelLoading, onClickWrapped })

    // --- Return virtual DOM node.
    return () => {
      // --- Decompose icon props.
      const iconAppend = props.iconAppend
      const iconPrepend = props.icon ?? props.iconPrepend
      const iconProps = { options: props.iconOptions, class: props.classIcon }

      // --- Create child nodes.
      const vNodeContent = slots.default?.(slotProps) ?? (props.label && h('span', props.label))
      const vNodeAppend = slots.append?.(slotProps) ?? (iconAppend && h(Icon, { icon: iconAppend, ...iconProps }))
      const vNodePrepend = slots.prepend?.(slotProps) ?? (iconPrepend && h(Icon, { icon: iconPrepend, ...iconProps }))

      // --- Compute internal link props.
      const isInternalLinkProps = isInternalLink.value && {
        'to': props.to,
        'active-class': props.classActive,
        'exact-active-class': props.classActiveExact,
      }

      // --- Compute external link props.
      const isExternalLinkProps = isExternalLink.value && {
        href: props.to,
        rel: props.newtab ? 'noreferrer' : attrs.rel,
      }

      // --- Compute button props.
      const isLinkProps = isLink.value && {
        target: props.newtab ? '_blank' : attrs.target,
      }

      const buttonProps = mergeProps(attrs, {
        'disabled': props.disabled || null,
        'readonly': props.readonly || null,
        'aria-disabled': props.disabled || null,
        'aria-readonly': props.readonly || null,
        'aria-busy': modelLoading.value || null,
        'aria-labelledby': props.label,
        'onClick': onClickWrapped.value,
        ...isInternalLinkProps,
        ...isExternalLinkProps,
        ...isLinkProps,
      })

      // --- Create and return VNode.
      return h(
        is.value,
        buttonProps,
        { default: () => [vNodePrepend, vNodeContent, vNodeAppend] },
      )
    }
  },
})
