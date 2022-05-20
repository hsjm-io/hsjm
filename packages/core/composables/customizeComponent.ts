/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/consistent-function-scoping */
import { mapValues } from '@hsjm/shared'
import { Component, SetupContext, h, mergeProps } from 'vue-demi'

export type CustomizeComponentPropsFn<T> = (props: Readonly<T>, context: SetupContext) => Record<string, any>
export type CustomizeComponentSlotFn<T> = (slotProps: Record<string, any>, props: Readonly<T>, context: SetupContext) => Record<string, any>

export type CustomizeComponent = <C extends Component<T>, T = {}>(
  component?: C,
  customProps?: CustomizeComponentPropsFn<T> | Record<string, any>,
  customSlots?: CustomizeComponentSlotFn<T> | Record<string, CustomizeComponentSlotFn<T>>,
) => C

/**
 * Instantiate a component and defaults it's props and slots.
 * @param component
 * @param customProps
 * @param customSlots
 * @returns
 */
export const customizeComponent: CustomizeComponent = (component: any, customProps: any, customSlots?: any): any =>
  // --- Create and return render function.
  (props: any, context: any) => {
    // --- Process and merge props.
    const mergedProperties = mergeProps(
      typeof customProps === 'function' ? customProps(props, context) : customProps ?? {},
      context.attrs,
      props,
    )

    // --- Process and merge slots.
    const customizedSlots = !customSlots || typeof customSlots === 'function'
      ? {
        ...context.slots,
        default: (slotProps: any) => {
          const result = typeof customSlots === 'function' ? customSlots(slotProps, props, context) : customSlots ?? {}
          return h(result.as ?? 'div', result, context.slots)
        },
      }
      : {
        ...context.slots,
        ...mapValues(customSlots, (customSlot: any) =>
          (slotProps: any) => {
            const result = typeof customSlot === 'function' ? customSlot(slotProps, props, context) : customSlot ?? {}
            return h(result.as ?? 'div', result, context.slots)
          },
        ),
      }

    // --- Compute VNode.
    return h(component, mergedProperties, customizedSlots || context.slots)
  }
