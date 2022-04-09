import mock from 'mock-require'
import model from './shadeColor/model.json'
import { colorToLayer, layerToColor } from './shadeColor/utils'

// --- Mock `gpu.js` import.
mock('gpu.js', {})

// --- Initialize NN and apply model.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const neuralNetwork = new (require('brain.js').NeuralNetwork)()
neuralNetwork.fromJSON(<any>model)

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
  const input = colorToLayer(color, shade.toString())
  const output = neuralNetwork.run(input)
  return layerToColor(output)
}

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
