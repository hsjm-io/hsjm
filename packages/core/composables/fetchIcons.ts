import { IconifyIconCustomisations } from '@iconify/iconify'
import { fullIconData, iconToSVG, replaceIDs } from '@iconify/utils'
import { defaults } from '@iconify/utils/lib/customisations'
import { fetchCollection } from './fetchCollections'

// --- Cached data.
const cachedIcons: Record<string, Promise<string>> = {}

/**
 * Retrieve an icon from a remote source.
 * @param iconName Name of the icon.
 */
export const fetchIcon = (iconName: string, options = {} as IconifyIconCustomisations) => {
  // --- Get from cache if exists.
  if (iconName in cachedIcons)
    return cachedIcons[iconName]

  // --- Extract icon from remote collection.
  const collectionName = iconName.split(/:|-/)[0]
  const icon = fetchCollection(collectionName)
    .then((collection) => {
      const iconKey = iconName.split(/:|-/).slice(1).join('-')
      const iconData = fullIconData(collection.icons[iconKey])
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
    })

  // --- Cache and return icon.
  return (cachedIcons[iconName] = icon)
}
