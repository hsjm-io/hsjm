import { ref, watch } from 'vue-demi'
import { MaybeRef, extendRef, isClient } from '@vueuse/shared'
import { IconifyIconCustomisations } from '@iconify/iconify'
import { createUnrefFn } from '@vueuse/core'
import { isDevelopment, resolvable } from '@hsjm/shared'
import { fetchIcon } from './fetchIcons'

/**
 * Resolve the SVG for a given icon with `@iconify`.
 * @param icon Name of the icon. (Example: `mdi:user` )
 * @param options Customisation options.
 */
export const useIconify = (icon: MaybeRef<string>, options = {} as MaybeRef<IconifyIconCustomisations>) => {
  // --- State.
  const svg = ref<string>('<svg></svg>')

  // --- Ready promise.
  const { promise, resolve } = resolvable()

  // --- Generate the icon's SVG.
  const update = async() => {
    svg.value = await createUnrefFn(fetchIcon)(icon, options)
    resolve()
  }

  // --- Update on server init & prop changes.
  watch([icon, options], update)

  // --- Update on init if not SSR.
  if (!isClient || isDevelopment) update()

  // --- Return SVG.
  return extendRef(svg, { ready: promise })
}
