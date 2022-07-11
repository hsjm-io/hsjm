/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Ref, isReactive, isRef, ref, unref, watch } from 'vue-demi'
import { MaybeRef } from '@vueuse/shared'
import { isDevelopment, isNode, requireSafe } from '@hsjm/shared'
import { SymbolOptions } from 'milsymbol'

/**
 * Resolve the SVG for a given sidc with `milsymbol`.
 * @param {MaybeRef<string>} sidc SIDH of the icon. (Example: `SFG-UCI----D` )
 * @param {MaybeRef<IconifyIconCustomisations>} [options] Customisation options.
 * @returns {Ref<string | undefined>} The SVG as a `Ref<string>`
 */
export const useMilsymbol = (sidc: MaybeRef<string>, options: MaybeRef<SymbolOptions> = {}): Ref<string | undefined> => {
  // --- Initalize state.
  const svg = ref<string | undefined>()

  // --- Require 'milsymbol'
  const MilSymbol = requireSafe<typeof import('milsymbol')>('milsymbol')
  if (!MilSymbol) throw new Error('Milsymbol dependency not found')

  // --- Declare function to get the svg.
  const update = () => svg.value = new MilSymbol.Symbol(unref(sidc), unref(options)).asSVG()

  // --- Update on server init if not SSR & on prop changes.
  if (isRef(sidc)) watch(sidc, update)
  if (isReactive(options)) watch(options, update)
  if (isNode || isDevelopment) update()

  // --- Return SVG ref.
  return svg
}
