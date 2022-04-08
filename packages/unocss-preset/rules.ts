import patterns from './constants/patterns'
import { Rule } from 'unocss'
import { Theme, parseColor } from '@unocss/preset-mini'

/**
 * Generate classes for unsplash backgrounds.
 */
export const ruleUnsplash = [
  /^bg-unsplash-(.{11})-?(\d+)?$/,
  ([,id, w]: string[]) => ({
    'background-image': `url(https://unsplash.com/photos/${id}/download${w ? `?w=${w}` : ''})`,
  })
]

export const ruleGradientMask = [
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
  }
]

export const rulePattern = [
  new RegExp(`^bg-(${Object.keys(patterns).join('|')})-(.+)$`),
  ([,pattern, color]: string[], { theme }: { theme: Theme }) => {
    // --- Resolve color.
    const themeColor = parseColor(color, theme)
    if (!themeColor?.color) return

    // --- Resolve pattern
    // @ts-expect-error: Too lazy to uninfer.
    const patternUrl = patterns[pattern]
      .replace('{{color}}', themeColor.color.replace('#', '%23'))
      .replace('{{opacity}}', '1')

    // --- Return CSS properties.
    return { 'background-image': patternUrl }
  }
]

export default [
  ['content', { content: '""' }],
  [/^content-(.*)$/, ([,content]: string[]) => ({ content })],
  ruleGradientMask,
  rulePattern,
  ruleUnsplash
]
