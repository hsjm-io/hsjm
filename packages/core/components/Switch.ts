/* eslint-disable unicorn/no-null */
import { useVModel } from '@vueuse/core'
import { PropType, defineComponent, h, toRefs } from 'vue-demi'
import { useSwitch } from '../composables'

export const Switch = defineComponent({
  name: 'Switch',

  props: {
    as: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: 'div',
    },
    value: { required: true },
    modelValue: null,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    unique: Boolean,
    classActive: { type: String, default: '' },
  },

  setup: (properties, { slots, emit }) => {
    const { value } = toRefs(properties)
    const model = useVModel(properties, 'modelValue', emit, { passive: true })
    const { attributes } = useSwitch(model, value, properties)
    return () => h(properties.as, attributes, slots)
  },
})
