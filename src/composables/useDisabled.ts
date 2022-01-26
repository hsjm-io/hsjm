//--- Import dependencies.
import { useVModel } from '@vueuse/core'
import { computed } from 'vue-demi'

//--- Define and expose `props` object.
export interface UseDisabledProps {
    disabled: boolean,
    readonly: boolean,
    disabledClass: string,
    readonlyClass: string,
}

//--- Compose.
export const useDisabled = (props: Readonly<UseDisabledProps>) => {

    //--- Define reactive variables.
  const disabled = useVModel(props, 'disabled')
  const readonly = useVModel(props, 'disabled')

    //--- Compute element attributes.
  const $attrs = computed(() => ({
      class: [{
          [props.disabledClass ?? 'disabled']: disabled.value,
          [props.readonlyClass ?? 'readonly']: readonly.value,
      }],
      'disabled': disabled.value ? 'true' : undefined,
      'readonly': readonly.value ? 'true' : undefined,
      'aria-disabled': disabled.value ? 'true' : undefined,
      'aria-readonly': readonly.value ? 'true' : undefined,
  }))

    //--- Return reactive properties.
  return { $attrs, disabled, readonly }
}
