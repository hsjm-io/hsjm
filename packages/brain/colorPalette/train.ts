import { hexToRgb } from './../../shared/color';
import { writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { NeuralNetwork } from 'brain.js'
import { hexToRgbArray, rgbToHex } from '@hsjm/shared'
import consola from 'consola'
import chalk from 'chalk'
import data from './data.json'

// --- Initialize NN.
const neuralNetwork = new NeuralNetwork({
  activation: 'sigmoid',
  hiddenLayers: [4],
})

const colorToNeuron = (color: string, shade: string | number) => {
  return [...hexToRgbArray(color).map(x => x / 255), +shade / 1000]
}

// --- Prepare dataset.
const dataset = Object.entries(data)
  .map(palette => palette[1])
  .filter(x => typeof x !== 'string')
  .map(palette => palette as Record<number, string>)
  .flatMap(palette => Object.entries(palette)
    .flatMap(([shade, color]) => {
      return [50,100,200,300,400,500,600,700,800,900].map(pShade => {
        return {
          input: colorToNeuron(palette[pShade], pShade),
          output: colorToNeuron(color, shade),
        }
      })
    }))

// --- Train NN with dataset.
const { error } = neuralNetwork.train(dataset, {
  iterations: 20000,
  errorThresh: 0.002,
  learningRate: 0.001,
  log: true,
  logPeriod: 1000
})

// --- Outputing test.
// const runTest = (color: string, shade: number) => {
//   const [r, g, b]: any = neuralNetwork.run(colorToNeuron(color, shade))
//   return rgbToHex({ r: r * 255, g: g * 255, b: b * 255 })
// }
// const chalkTest = (color: string, shade: number) => {
//   const output = runTest(color, shade)
//   return chalk.bgHex(output).black(hexToRgbArray(output).join(', '))
// }
// const colorTest = '#B8B6FF'
// consola.info(`
//   Default: ${chalk.bgHex(colorTest).black(colorTest)},
//   50: ${chalkTest(colorTest, 50)},
//   100: ${chalkTest(colorTest, 100)},
//   200: ${chalkTest(colorTest, 200)},
//   300: ${chalkTest(colorTest, 300)},
//   400: ${chalkTest(colorTest, 400)},
//   500: ${chalkTest(colorTest, 500)},
//   600: ${chalkTest(colorTest, 600)},
//   700: ${chalkTest(colorTest, 700)},
//   800: ${chalkTest(colorTest, 800)},
//   900: ${chalkTest(colorTest, 900)},
// `)

// --- Save model to `.json` file.
const model = JSON.stringify(neuralNetwork.toJSON(), undefined, 2)
const root = resolve(__dirname, '../../..')
const outPath = resolve(__dirname, 'model.json')
const outPathRelative = relative(root, outPath)
writeFileSync(outPath, model)
consola.success(`Trained and saved NN model to "${outPathRelative}" (error: ${error.toFixed(4)})`)
