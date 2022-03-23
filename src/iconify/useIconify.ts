import { ref, unref, watch } from 'vue-demi'
import { MaybeRef, isClient, extendRef } from '@vueuse/shared'
import { IconifyIconCustomisations } from '@iconify/iconify'
import { resolvable } from '@hsjm/core'
import { fetchIcon } from './fetchIcons'

/**
 * Resolve the SVG for a given icon with `@iconify`.
 * @param icon Name of the icon. (Example: `mdi:user` )
 * @param options Customisation options.
 */
export const useIconify = (icon: MaybeRef<string>, options = {} as IconifyIconCustomisations) => {

  // --- State.
  const svg = ref<string>('<svg></svg>')

  // --- Ready promise.
  const { promise, resolve } = resolvable()

  // --- Generate the icon's SVG.
  const update = async () => {
    svg.value = await fetchIcon(unref(icon), options)
    resolve()
  }

  // --- Update on server init & prop changes.
  watch(() => [icon, options], update)

  // @ts-ignore --- Update on init if not SSR.
  if(!isClient || import.meta.env.DEV) update()

  // --- Return SVG.
  return extendRef(svg, { ready: promise })
}
