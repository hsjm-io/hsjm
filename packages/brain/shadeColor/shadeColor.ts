import mock from 'mock-require'
import model from './model/data.json'
import { colorToLayer, layerToColor } from './utils'

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
