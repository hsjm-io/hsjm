import { isReactive, isRef, ref, unref, watch } from 'vue-demi'
import { MaybeRef } from '@vueuse/shared'
import { isDevelopment, isNode } from '@hsjm/shared'
import { Symbol, SymbolOptions } from 'milsymbol'

/**
 * Resolve the SVG for a given Nato Icon.
 * @param sidc Name of the symbol. (Example: ``)
 * @param options Customisation options.
 */
export const useMilsymbol = (sidc: MaybeRef<string>, options = {} as MaybeRef<SymbolOptions>) => {
  // --- State.
  const svg = ref<string>('<svg></svg>')

  // --- Create and append the icon in the template.
  const update = () => {
    const symbol = new Symbol(unref(sidc), { size: 24 })
    svg.value = symbol.asSVG()
  }

  // --- Update on server init & prop changes.
  if (isRef(sidc)) watch(sidc, update)
  if (isRef(options) || isReactive(options)) watch(options, update)

  // --- Update on init if not SSR.
  if (isNode || isDevelopment) update()

  // --- Return SVG.
  return svg
}
