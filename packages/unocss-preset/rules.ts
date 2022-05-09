import { Theme, parseColor } from '@unocss/preset-mini'
import { Rule } from 'unocss'
import { patterns } from './constants/patterns'
import { separators } from './constants/separators'

/**
 * Generate classes for unsplash backgrounds.
 */
export const ruleUnsplash: Rule = [
  /^bg-unsplash-(.{11})-?(\d+)?$/,
  ([,id, w]: string[]) => ({
    'background-image': `url(https://unsplash.com/photos/${id}/download${w ? `?w=${w}` : ''})`,
  }),
  {
    autocomplete: [
      'bg-unsplash-<any>',
      'bg-unsplash-<any>-<480|720|1280|1920>',
    ],
  },
]

export const ruleGradientMask: Rule = [
  /^gradient-mask-([blrt]{1,2})-?(\w{1,3})?$/,
  ([,directionKey, opacity]: string[]) => {
    const direction = {
      t: 'to top',
      tr: 'to top right',
      r: 'to right',
      br: 'to bottom right',
      b: 'to bottom',
      bl: 'to bottom left',
      l: 'to left',
      tl: 'to top left',
    }[directionKey]
    if (!direction) return
    const maskImage = `linear-gradient(${direction}, rgba(0, 0, 0, 1.0) ${opacity ?? 0}%, transparent 100%)`
    return { 'mask-image': maskImage, '-webkit-mask-image': maskImage }
  },
]

export const rulePattern: Rule = [
  new RegExp(`^bg-(${Object.keys(patterns).join('|')})-([^\\/]+)(?:\\/(\\d{1,3}))?$`),
  ([,pattern, color, opacity]: string[], { theme }: { theme: Theme }) => {
    // --- Resolve color.
    const themeColor = parseColor(color, theme)
    if (!themeColor?.color) return

    // --- Resolve pattern
    // @ts-expect-error: Too lazy to uninfer.
    const svg = patterns[pattern]
      .replace('{{color}}', themeColor.color)
      .replace('{{opacity}}', opacity ? (Number.parseInt(opacity) / 100).toFixed(2) : '1')

    // --- Return CSS properties.
    return { 'background-image': `url('data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}')` }
    // return { 'background-image': `url('data:image/svg+xml;${svg}')` }
  },
  {
    autocomplete: [
      `bg-(${Object.keys(patterns).join('|')})`,
      `bg-(${Object.keys(patterns).join('|')})-$colors`,
      `bg-(${Object.keys(patterns).join('|')})-$colors/<num>`,
    ],
  },
]

export const ruleSeparator: Rule = [
  new RegExp(`^separator-(${Object.keys(separators).join('|')})-([^\\/]+)(?:\\/(\\d{1,3}))?$`),
  ([,separator, color, opacity]: string[], { theme }: { theme: Theme }) => {
    // --- Resolve color.
    const themeColor = parseColor(color, theme)
    if (!themeColor?.color) return

    // --- Resolve pattern
    // @ts-expect-error: Too lazy to uninfer.
    const svg = separators[separator]
      .replace('{{color}}', themeColor.color)
      .replace('{{opacity}}', opacity ? (Number.parseInt(opacity) / 100).toFixed(2) : '1')

    // --- Return CSS properties.
    return {
      'background-image': `url('data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}')`,
      'background-size': '100% 100%',
    }
  },
  {
    autocomplete: [
      `separator-(${Object.keys(separators).join('|')})`,
      `separator-(${Object.keys(separators).join('|')})-$colors`,
      `separator-(${Object.keys(separators).join('|')})-$colors/<num>`,
    ],
  },
]

export const ruleInnerContent: Rule = [
  /^inner-content(?:-?(.*))?$/,
  ([,content]: string[]) => ({ content: `"${content ?? ''}+"` }),
]

export const rules: Rule[] = [
  ruleInnerContent,
  ruleGradientMask,
  rulePattern,
  ruleSeparator,
  ruleUnsplash,
]
