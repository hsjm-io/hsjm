import { HSL, RGB } from './types'

const hueP = (p: number, q: number, t: number) => {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

/**
 * Converts HSL values to RGB.
 * @param {HSL} hsl The HSL values
 * @returns {RGB} The RGB values
 * @return The RGB representation
 * @see http://en.wikipedia.org/wiki/HSL_color_space.
 */
export const hslToRgb = ({ h, s, l }: HSL): RGB => {
  h /= 360
  s /= 100
  l /= 100
  let r = l
  let g = l
  let b = l

  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hueP(p, q, h + 1 / 3)
    g = hueP(p, q, h)
    b = hueP(p, q, h - 1 / 3)
  }

  return <RGB>{
    r: r * 255,
    g: g * 255,
    b: b * 255,
  }
}
