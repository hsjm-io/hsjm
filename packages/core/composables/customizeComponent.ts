/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/consistent-function-scoping */
import { mapValues } from '@hsjm/shared'
import { Component, SetupContext, h, mergeProps } from 'vue-demi'

export type CustomizeComponentPropsFn<T> = (props: Readonly<T>, context: SetupContext) => Record<string, any>
export type CustomizeComponentSlotFn<T> = (slotProps: Record<string, any>, props: Readonly<T>, context: SetupContext) => Record<string, any>

export type CustomizeComponent = <C extends Component<T>, T = {}>(
  component: C,
  customProps?: CustomizeComponentPropsFn<T> | Record<string, any>,
  customSlots?: CustomizeComponentSlotFn<T> | Record<string, CustomizeComponentSlotFn<T>>,
) => C

/**
 * Customizes a component by merging provided props and slots into the component.
 * @param component The component to customize
 * @param customProps A mapping of props to merge into the component. If a function, it will receive `props` and `context` and should return an object.
 * @param customSlots A mapping of slots to merge into the component. If a function, it will receive `slotProps` and `props` and `context` and should return an object.
 * @returns A new component that merges the provided props and slots into the given component.
 * @example ```js
 * import { Switch } from '@headlessui/vue'
 * import { customizeComponent } from '@hsjm/core'
 *
 * const MyCustomizedComponent = customizeComponent(Switch, { class: 'switch' })
 * ```
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
