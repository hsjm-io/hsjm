/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
import { ValidateRuleSetResult, ValidationRule, ValidationRulePipe, ValidationRuleSet, capitalize, debounce, isTruthy, omit, pick, throttle, validateRuleSet } from '@hsjm/shared'
import { PropType, computed, defineComponent, h, markRaw, mergeProps, ref } from 'vue-demi'
import { useVModel } from '@vueuse/core'
import { IconifyIconCustomisations } from '@iconify/iconify'
import { exposeToDevtool } from '../utils'
import { Icon } from './Icon'
import { InputList } from './InputList'
import { InputText } from './InputText'

export const Input = /* @__PURE__ */ defineComponent({
  name: 'Input',
  inheritAttrs: true,
  props: {
    ...InputList.props,
    ...InputText.props,

    // --- Base options.
    type: { type: String as PropType<HTMLInputElement['type'] | 'select' | 'list' | 'listbox'>, default: 'text' },
    name: String,
    label: String,

    // --- State.
    modelValue: {} as PropType<any>,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,

    // --- Message/error.
    message: String,
    error: String as PropType<string>,
    errorLocalize: Function as PropType<(error: string) => string>,

    // --- Validation.
    rules: [Object, Array, Function] as PropType<ValidationRule | ValidationRulePipe | ValidationRuleSet>,
    validateOn: String as PropType<keyof GlobalEventHandlersEventMap>,
    validateThrottle: { type: [Number, String] as PropType<number | `${number}`>, default: 0 },
    validateDebounce: { type: [Number, String] as PropType<number | `${number}`>, default: 0 },
    validationContext: { type: Object as PropType<any>, default: () => ({}) },

    // --- Icon
    icon: String,
    iconAppend: String,
    iconPrepend: String,
    iconOptions: Object as PropType<IconifyIconCustomisations>,

    // --- Classes.
    classInput: {} as PropType<any>,
    classLabel: {} as PropType<any>,
    classGroup: {} as PropType<any>,
    classError: {} as PropType<any>,
    classMessage: {} as PropType<any>,
    classIcon: {} as PropType<any>,

    // --- Events.
    onInput: Function,
    onBlur: Function,
    onFocus: Function,
    onChange: Function,
    onClickAppend: Function,
    onClickPrepend: Function,
  },
  setup: (props, { attrs, slots, emit }) => {
    // --- Two-way bindings.
    const modelValue = useVModel(props, 'modelValue', emit, { passive: true })
    const modelDisabled = useVModel(props, 'disabled', emit, { passive: true })
    const modelReadonly = useVModel(props, 'readonly', emit, { passive: true })
    const modelLoading = useVModel(props, 'loading', emit, { passive: true })
    const modelError = useVModel(props, 'error', emit, { passive: true })

    // --- Declare internal refs
    const validationResults = ref<ValidateRuleSetResult>()
    const lastValidatedValue = ref<any>(modelValue.value)

    // --- Computed component type.
    const inputComponent = markRaw(computed(() => (props.type === 'listbox' ? InputList : InputText)))
    const inputPropKeys = markRaw(computed(() => Object.keys(inputComponent.value.props)))

    // --- Expose to Vue Devtools for debugging.
    const slotProps = exposeToDevtool({
      inputComponent,
      inputPropKeys,
      validationResults,
      modelValue,
      modelDisabled,
      modelReadonly,
      modelLoading,
      modelError,
    })

    // --- Computed function to validate the value.
    // --- This function can be debounced or throttled.
    const validateWithEffect = computed(() => {
      const validate = async(event: InputEvent & { target: HTMLInputElement }) => {
        // --- Handle missing rules.
        if (!props.rules) return console.warn('Could not validate input: No validation rules provided.', event.target)

        // --- Validate and transform the value.
        modelLoading.value = true
        lastValidatedValue.value = event.target.value
        validationResults.value = await validateRuleSet(event.target.value, props.rules, props.validationContext)
        modelError.value = validationResults.value.error?.message

        // --- Set the transformed value if the value is valid and is the same as the last validated value.
        if (validationResults.value.isValid && lastValidatedValue.value === event.target.value) {
          const cursor = event.target.selectionStart
          event.target.value = validationResults.value.value
          if (cursor) event.target.setSelectionRange(cursor, cursor)
        }

        // --- Emit the `validate` event.
        emit('validate', validationResults.value)
        modelLoading.value = false
      }

      // --- Throttle or debounce and return function.
      if (+props.validateThrottle > 0) return throttle(validate, +props.validateThrottle)
      if (+props.validateDebounce > 0) return debounce(validate, +props.validateDebounce)
      return validate
    })

    // --- Wrap events.
    const createEvent = (eventName: string, setValue?: boolean) => async(event: any) => {
      // --- Prevent default, set value and emit event.
      event.preventDefault()
      const value = event?.target?.value ?? event

      // --- Validate.
      if (props.validateOn === eventName) validateWithEffect.value(event)

      // --- Callback.
      modelLoading.value = true
      const callbackName = `on${capitalize(eventName)}`
      const callback = (<any>props)[callbackName]
      if (typeof callback === 'function') await callback(value)
      modelLoading.value = false

      // --- Set the new value.
      if (setValue) {
        const cursor = event.target.selectionStart
        modelValue.value = value
        emit(eventName, value)
        if (cursor) event.target.setSelectionRange(cursor, cursor)
      }
    }

    // --- Return virtual DOM node.
    return () => {
      // --- Decompose icon props.
      const iconAppend = props.iconAppend
      const iconPrepend = props.icon ?? props.iconPrepend
      const iconProps = { options: props.iconOptions, class: props.classIcon }

      // --- Create child nodes.
      const vNodeAppend = slots.append?.(slotProps) ?? (iconAppend && h(Icon, { icon: iconAppend, ...iconProps }))
      const vNodePrepend = slots.prepend?.(slotProps) ?? (iconPrepend && h(Icon, { icon: iconPrepend, ...iconProps }))
      const vNodeMessage = slots.message?.(slotProps) ?? (props.message && h('span', { class: props.classMessage }, props.message))
      const vNodeError = slots.error?.(slotProps) ?? (props.error && h('span', { class: props.classError }, props.error))
      const vNodeLabel = slots.label?.(slotProps) ?? (props.label && h('label', { class: props.classLabel, for: props.name }, props.label))

      // --- Build input props.
      const inputProps = mergeProps(
        omit(attrs, ['class', 'style']),
        pick(props, inputPropKeys.value),
        pick({
          ref: 'input',
          role: 'input',
          class: props.classInput,
          onInput: createEvent('input', true),
          onBlur: createEvent('blur'),
          onFocus: createEvent('focus'),
          onChange: createEvent('change'),
          onClick: createEvent('click'),
        }, isTruthy),
      )

      // --- Create input/textarea/select.
      const vNodeinput = slots.input?.(slotProps) ?? h(inputComponent.value, inputProps, slots)
      const vNodeinputGroup = h('div', { class: props.classGroup }, [vNodePrepend, vNodeinput, vNodeAppend])
      return h('div', {
        'aria-invalid': !!modelValue.value,
        'aria-readonly': !!modelReadonly.value,
        'aria-disabled': !!modelDisabled.value,
      }, [vNodeLabel, vNodeinputGroup, vNodeError ?? vNodeMessage])
    }
  },
})
