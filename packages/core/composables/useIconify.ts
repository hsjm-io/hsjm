import { Ref, isReactive, isRef, ref, unref, watch } from 'vue-demi'
import { MaybeRef } from '@vueuse/shared'
import { IconifyIcon, IconifyIconCustomisations } from '@iconify/iconify'
import { expandIconSet, fullIconData, iconToSVG, replaceIDs } from '@iconify/utils'
import { defaults } from '@iconify/utils/lib/customisations'
import { isDevelopment, isNode, memoize } from '@hsjm/shared'

/** Fetch an icon data from cache or remote */
const fetchIconData = memoize(async(icon: string): Promise<Required<IconifyIcon> | undefined> => {
  // --- Extract collection and icon names.
  const matches = icon.match(/(.+?)[:-](.+)/)
  if (!matches) return undefined
  const [, collectionName, iconName] = [...matches]

  // --- Fetch data from cache orremote.
  return fetch(`https://api.iconify.design/${collectionName}.json?icons=${iconName}`).then(async(response) => {
    const iconSet = await response.json()
    if (!iconSet || !iconSet.icons[iconName]) return

    // --- Compile icon data.
    expandIconSet(iconSet)
    return fullIconData(iconSet.icons[iconName])
  })
})

/** Fetch an icon and get it as an SVG */
const fetchIconSvg = async(icon: string, options: IconifyIconCustomisations): Promise<string | undefined> => {
  // --- Fetch data from cache or remote.
  const iconData = await fetchIconData(icon)
  if (!iconData) return undefined

  // --- Compile icon data.
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
