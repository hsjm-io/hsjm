import { NeuralNetwork } from 'brain.js'
import { hexToRgbArray, rgbToHex } from '@hsjm/core'
import colorPaletteModel from './models/colorPalette.json'

// --- Initialize NN and apply model.
const neuralNetwork = new NeuralNetwork()
// @ts-expect-error: `colorPaletteModel` is not infered as const.
neuralNetwork.fromJSON(colorPaletteModel)

/** TailwindCSS / WindiCSS color palette. */
export interface ColorPalette {
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
 * Generate the variant of a color.
 * @param color Color to shade
 * @param shade Shade value.
 */
export const shadeColor = (color: string, shade: string | number) => {
  const input = [...hexToRgbArray(color).map(x => x / 255), +shade / 1000]
  const [r, g, b]: any = neuralNetwork.run(input)
  return rgbToHex({ r: r * 255, g: g * 255, b: b * 255 })
}

/**
 * Generate a TailwindCSS / WindiCSS color palette from a single hex color.
 * @param color Input color.
 */
export const createColorPalette = (color: string): ColorPalette => ({
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
