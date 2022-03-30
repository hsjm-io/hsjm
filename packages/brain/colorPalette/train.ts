import { writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { NeuralNetwork } from 'brain.js'
import { hexToRgbArray } from '@hsjm/core'
import colors from 'windicss/colors'
import consola from 'consola'

// --- Initialize NN.
const neuralNetwork = new NeuralNetwork({
  activation: 'sigmoid',
  hiddenLayers: [8],
})

// --- Prepare dataset.
const data = Object.entries(colors)
  .map(palette => palette[1])
  .filter(x => typeof x !== 'string')
  .map(palette => palette as Record<number, string>)
  .flatMap(palette => Object.entries(palette)
    .map(([shade, color]) => ({
      input: [...hexToRgbArray(palette[500]).map(x => x / 255), +shade / 1000],
      output: [...hexToRgbArray(color).map(x => x / 255), +shade / 1000],
    })))

// --- Train NN with dataset.
const { error } = neuralNetwork.train(data, {
  iterations: 100000,
  errorThresh: 0.003,
  learningRate: 0.001,
})

// --- Save model to `.json` file.
const model = JSON.stringify(neuralNetwork.toJSON(), undefined, 2)
const root = resolve(__dirname, '../../..')
const outPath = resolve(__dirname, 'model.json')
const outPathRelative = relative(root, outPath)
writeFileSync(outPath, model)
consola.success(`Trained and saved NN model to "${outPathRelative}" (error: ${error.toFixed(4)})`)
