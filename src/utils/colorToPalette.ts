import { clamp } from "lodash"

/**
 * Adjust color brightness.
 * @param color Color to adjust.
 * @param amount Relative brightness.
 */
 const colorBrightness = (color: string, amount: number) => {
  var hex = parseInt(color.replace(/^#/, ''), 16)
  var r = clamp((hex >> 16) + amount, 0, 255)
  var b = clamp(((hex >> 8) & 0x00FF) + amount, 0, 255)
  var g = clamp((hex & 0x0000FF) + amount, 0, 255)
  var newColor = g | (b << 8) | (r << 16)
  return '#' + newColor.toString(16)
}

/**
 * TailwindCSS / WindiCSS color palette.
 */
 interface ColorPalette {
  default: string
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

/**
 * Generate a TailwindCSS / WindiCSS color palette from a single hex color.
 * @param color Input color, can be any format. For example : `#ff9` or `#rgb(200,30, 40)`
 */
 export const colorToPalette = (color: string): ColorPalette => ({
  default: color,
  50: colorBrightness(color, 130),
  100: colorBrightness(color, 120),
  200: colorBrightness(color, 90),
  300: colorBrightness(color, 60),
  400: colorBrightness(color, 30),
  500: color,
  600: colorBrightness(color, -30),
  700: colorBrightness(color, -60),
  800: colorBrightness(color, -90),
  900: colorBrightness(color, -120),
})
