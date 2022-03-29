import { computed } from 'vue-demi'

/**
 * Computes a list of applied CSS classes from the prop values.
 * @param props Object used to conditionnaly apply the CSS classes.
 * @param targets Whitelist of CSS classes. Can be an array of classes or the CSS Module object.
 * @returns An array of CSS classes to apply on the root of the component.
 *
 * @example
 * ```
 * <script setup>
 * import { useCssModule } from 'vue-demi'
 * import { usePropertiesClasses } from '@hsjm/core'
 *
 * const props = defineProps<{
 *  size?: 'small' | 'large'
 *  vertical?: boolean
 * }>()
 *
 * const $style = useCssModule()
 * const classes = usePropertiesClasses(props, $style)
 * </script>
 *
 * <template>
 *   <div :class="classes"> ... </div>
 * </template>
 *
 * <style module>
 * .small { ... }
 * .large { ... }
 * .vertical { ... }
 * </style>
 *
 * ```
 */
export const usePropertiesClasses = (
  props: Record<string, any>,
  targets = [] as string[] | Record<string, string>,
) => computed(() => {
  // --- Initialize the returned array.
  const classes = []

  // --- Filter-in CSS classes from an array.
  if (Array.isArray(targets)) {
    for (const target of targets) {
      const value = props[target]
      const className = value === true ? target : value
      classes.push(className)
    }
  }

  // --- Filter-in CSS classes from the CSS Module object.
  else {
    for (const propertyName in props) {
      const value = props[propertyName]
      const className = value === true ? targets[propertyName] : targets[value]
      classes.push(className)
    }
  }

  // --- Filter-out invalid and double values.
  return [...new Set(classes.filter(x => typeof x === 'string'))] as string[]
})
