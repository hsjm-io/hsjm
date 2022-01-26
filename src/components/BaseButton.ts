import { merge } from 'lodash-es';
import { computed } from 'vue-demi';
import {
  useLoading, UseLoadingOptions,
  useDisabled, UseDisabledProps,
} from '~/composables'

export type BaseButtonProps = 
  UseDisabledProps &
  UseLoadingOptions

export const BaseButton = (options: Readonly<BaseButtonProps>) => {
  return computed(() => merge({}, 
    useLoading(options),
    useDisabled(options),
  ))
}

// //--- Define Vue component.
// export const BaseButton = defineComponent({

//     props: {

//         //--- Component props.
//         is: {type: String, default: 'button'},
//         modelValue: Boolean,
//         toggle: Boolean,

//         //--- Useables props.
//         ...useLinkProps,
//         ...useDisabledProps,
//         ...useLoadingProps,

//         //--- Catch listeners.
//         onClick: Function,
//     },

//     setup(props, {attrs, emit}){

//         //--- Init reactive properties.
//         const modelValue = useVModel(props, 'modelValue', undefined, {passive: true})
//         const { classes: classesDisabled, attributes: attributesDisabled } = useDisabled(props)

//         const { classes: classesRouting, href, isLink, isInternalLink, isExternalLink, navigate } = useLink(props)
//         const { classes: classesLoading, loading } = useLoading(props)
//         const tag = computed(() => isLink.value ? 'a' : props.is ?? 'button')

//         //--- Define onClick handler.
//         const onClick = async (e: Event) => {

//             //--- Avoid native navigation.
//             // if(isExternalLink.value)
//                 e.preventDefault()

//             //--- Avoid any interation when `disabled`.
//             if(props.disabled || props.readonly) return

//             //--- Call `@click` and toggle `modelValue`.
//             loading.value = true
//             if(props.toggle) modelValue.value = !modelValue.value
//             if(props.onClick) await props.onClick()
//             loading.value = false

//             //--- Call `vue-router` navigation.
//             if(isInternalLink.value) navigate.value()
//         }

//         //--- Compute CSS classes.
//         const classes = computed(() => ({
//             'active': modelValue.value,
//             ...classesDisabled.value,
//             ...classesRouting.value,
//             ...classesLoading.value,
//         }))

//         const attributes = computed(() => ({
//             href: href.value,
//             class: classes.value,
//             onClick: onClick,
//             'role': props.onClick ? 'button' : undefined,
//             ...attributesDisabled.value,
//         }))

//         return { tag, loading, attributes, isExternalLink }
//     }
// })

