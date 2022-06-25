import { Ref, isReactive, isRef, ref, unref, watch } from 'vue-demi'
import { MaybeRef } from '@vueuse/shared'
import { IconifyIconCustomisations } from '@iconify/iconify'
import { expandIconSet, fullIconData, iconToSVG, replaceIDs } from '@iconify/utils'
import { defaults } from '@iconify/utils/lib/customisations'
import { isDevelopment, isNode } from '@hsjm/shared'

/**
 * Fetch an icon and get it as an SVG
 * @param {string} icon Icon to fetch
 * @param {IconifyIconCustomisations} options Iconify options
 * @returns {Promise<string>} SVG string
 */
const fetchIconSvg = async(icon: string, options: IconifyIconCustomisations): Promise<string | undefined> => {
  // --- Extract collection and icon names.
  const matches = icon.match(/(.+?)[:-](.+)/)
  if (!matches) return undefined
  const [, collectionName, iconName] = [...matches]

  // --- Fetch data from remote.
  const response = await fetch(`https://api.iconify.design/${collectionName}.json?icons=${iconName}`)
  const iconSet = await response.json()

  // --- Compile icon data.
  expandIconSet(iconSet)
  if (!iconSet.icons[iconName]) return undefined
  const iconData = fullIconData(iconSet.icons[iconName])
  const renderData = iconToSVG(iconData, { ...defaults, ...options })

  // --- Generate attributes for SVG element
  const svgAttributes: Record<string, string> = {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    ...renderData.attributes,
    ...(renderData.inline) ? { style: 'vertical-align: -0.125em;' } : {},
  }

  // --- Inline DOM attributes.
  const svgAttributesString = Object.entries(svgAttributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')

  // --- Generate SVG.
  return `<svg ${svgAttributesString}>${replaceIDs(renderData.body)}</svg>`
}

/**
 * Resolve the SVG for a given icon with `@iconify`.
 * @param {MaybeRef<string>} icon Name of the icon. (Example: `mdi:user` )
 * @param {MaybeRef<IconifyIconCustomisations>} [options] Customisation options.
 * @returns {Ref<string | undefined>} The SVG as a `Ref<string>`
 */
export const useIconify = (icon: MaybeRef<string>, options: MaybeRef<IconifyIconCustomisations> = {}): Ref<string | undefined> => {
  // --- Initalize state.
  const svg = ref<string>()

  // --- Declare function to get the svg.
  const update = async() => {
    svg.value = undefined
    svg.value = await fetchIconSvg(unref(icon), unref(options))
  }

  // --- Update on server init & prop changes.
  if (isRef(icon)) watch(icon, update)
  if (isRef(options) || isReactive(options)) watch(options, update)
  if (isNode || isDevelopment) update()

  // --- Return SVG ref.
  return svg
}
