/* eslint-disable @typescript-eslint/consistent-type-imports */
import { isReactive, isRef, nextTick, ref, unref, watch } from 'vue-demi'
import { MaybeRef } from '@vueuse/shared'
import { isDevelopment, isNode } from '@hsjm/shared'
import Milsymbol, { SymbolOptions } from 'milsymbol'

/**
 * Resolve the SVG for a given sidc with `milsymbol`.
 * @param {MaybeRef<string>} sidc SIDH of the icon. (Example: `SFG-UCI----D` )
 * @param {MaybeRef<IconifyIconCustomisations>} [options] Customisation options.
 * @returns The SVG as a `Ref<string>`
 */
export const useMilsymbol = (sidc: MaybeRef<string>, options: SymbolOptions = {}) => {
  // --- Initalize state.
  const svg = ref<string>()

  // --- Declare function to get the svg.
  const update = async() => {
    const unrefSidc = unref(sidc)?.padEnd?.(12, '-')
    svg.value = new Milsymbol.Symbol(unrefSidc, options).asSVG()
  }

  // --- Update on server init if not SSR & on prop changes.
  if (isRef(sidc)) watch(sidc, update)
  if (isReactive(options)) watch(options, update)
  if (isNode || isDevelopment) nextTick().then(update)

  // --- Return SVG ref.
  return { svg, update }
}
