import { Ref, isReactive, isRef, ref, unref, watch } from 'vue-demi'
import { MaybeRef } from '@vueuse/shared'
import { isDevelopment, isNode } from '@hsjm/shared'
import { Symbol, SymbolOptions } from 'milsymbol'

/**
 * Resolve the SVG for a given sidc with `milsymbol`.
 * @param {MaybeRef<string>} sidc SIDH of the icon. (Example: `SFG-UCI----D` )
 * @param {MaybeRef<IconifyIconCustomisations>} [options] Customisation options.
 * @returns {Ref<string | undefined>} The SVG as a `Ref<string>`
 */
export const useMilsymbol = (sidc: MaybeRef<string>, options: MaybeRef<SymbolOptions> = {}): Ref<string | undefined> => {
  // --- Initalize state.
  const svg = ref<string | undefined>()

  // --- Declare function to get the svg.
  const update = () => svg.value = new Symbol(unref(sidc), { size: 24 }).asSVG()

  // --- Update on server init if not SSR & on prop changes.
  if (isRef(sidc)) watch(sidc, update)
  if (isRef(options) || isReactive(options)) watch(options, update)
  if (isNode || isDevelopment) update()

  // --- Return SVG ref.
  return svg
}
