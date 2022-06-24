import { ColorPalette, shadeColor } from './shadeColor'

/**
 * Generate a TailwindCSS / WindiCSS color palette from a single hex color.
 * @param color Input color.
 */

export const createPalette = (color: string): ColorPalette => ({
  50: shadeColor(color, 50),
  100: shadeColor(color, 100),
  200: shadeColor(color, 200),
  300: shadeColor(color, 300),
  400: shadeColor(color, 400),
  500: shadeColor(color, 500),
  600: shadeColor(color, 600),
  700: shadeColor(color, 700),
  800: shadeColor(color, 800),
  900: shadeColor(color, 900),
})
