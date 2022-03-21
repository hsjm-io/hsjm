import { ref, unref, watch, Ref } from 'vue-demi'
import { MaybeRef, isClient, extendRef } from '@vueuse/shared'
import type { IconifyIconCustomisations, IconifyJSON } from '@iconify/iconify'
import { iconToSVG, expandIconSet, fullIconData, replaceIDs } from '@iconify/utils'
import { defaults } from '@iconify/utils/lib/customisations'
import axios from 'axios'

// --- Cached data.
const cachedIcons: Record<string, Promise<string>> = {}
const cachedCollections: Record<string, Promise<IconifyJSON>> = {}

/**
 * Retrieve a set of icons from a remote source.
 * @param collectionName Name of the collection.
 */
const fetchCollection = (collectionName: string) => {

  // --- Get from cache if exists.
  if(collectionName in cachedCollections) return cachedCollections[collectionName]

  // --- Fetch collection data from remote.
  const collection = axios
    .get<IconifyJSON>(`https://raw.githubusercontent.com/iconify/icon-sets/master/json/${collectionName}.json`)
    .then(res => { expandIconSet(res.data); return res.data })

  // --- Cache and return collection data.
  return (cachedCollections[collectionName] = collection)
}

/**
 * Retrieve an icon from a remote source.
 * @param iconName Name of the icon.
 */
const fetchIcon = (iconName: string, options = {} as IconifyIconCustomisations) => {

  // --- Get from cache if exists.
  if(iconName in cachedIcons) return cachedIcons[iconName]

  // --- Extract icon from remote collection.
  const collectionName = iconName.split(/:|-/)[0]
  const icon = fetchCollection(collectionName)
    .then(collection => {
      const iconKey = iconName.split(/:|-/).slice(1).join('-')
      const iconData = fullIconData(collection.icons[iconKey])
      const renderData = iconToSVG(iconData, { ...defaults, ...options });
  
      // --- Generate attributes for SVG element
      const svgAttributes: Record<string, string> = {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        ...renderData.attributes,
        ...(renderData.inline) ? { style: 'vertical-align: -0.125em;' } : {}
      }
  
      // --- Inline DOM attributes.
      const svgAttributesStr = Object.entries(svgAttributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ')
  
      // --- Generate SVG.
      return `<svg ${svgAttributesStr}>${replaceIDs(renderData.body)}</svg>`;
    })

  // --- Cache and return icon.
    return (cachedIcons[iconName] = icon)
}

/**
 * Resolve the SVG for a given icon with `@iconify`.
 * @param icon Name of the icon. (Example: `mdi:user` )
 * @param options Customisation options.
 */
export const useIconify = (icon: MaybeRef<string>, options = {} as IconifyIconCustomisations) => {

  // --- State.
  const svg = ref<string>('')

  // --- Ready promise.
  let readyResolve: Function
  const ready = new Promise(resolve => readyResolve = resolve)

  // --- Generate the icon's SVG.
  const update = async () => {
    svg.value = await fetchIcon(unref(icon), options)
    readyResolve()
  }

  // --- Update on server init & prop changes.
  watch(() => [icon, options], update)

  // @ts-ignore --- Update on init if not SSR.
  if(import.meta?.env.SSR && !isClient || import.meta?.env.DEV)
    update()

  // --- Return SVG.
  return extendRef(svg, { ready })
}
