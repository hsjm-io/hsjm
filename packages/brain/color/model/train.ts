/* eslint-disable no-console */
import { writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { cwd } from 'node:process'
import { hslToHex } from '@hsjm/shared'
import { NeuralNetwork } from 'brain.js'
import consola from 'consola'
import chalk from 'chalk'
import { plot } from 'asciichart'
import { shuffle } from 'lodash'
import { colorToLayer, logPalette } from '../utils'
import data from './data.json'

// --- Initialize NN.
const neuralNetwork = new NeuralNetwork({
  activation: 'sigmoid',
  hiddenLayers: [16],
})

const _runOne = (color: string, shade: number) => {
  const { h, s, l }: any = neuralNetwork.run(colorToLayer(color, shade.toString()))
  return hslToHex({ h: h * 360, s: s * 100, l: l * 100 })
}

// --- Outputing test.
const run = (color: string) => ({
  50: _runOne(color, 50),
  100: _runOne(color, 100),
  200: _runOne(color, 200),
  300: _runOne(color, 300),
  400: _runOne(color, 400),
  500: _runOne(color, 500),
  600: _runOne(color, 600),
  700: _runOne(color, 700),
  800: _runOne(color, 800),
  900: _runOne(color, 900),
})

// --- Prepare dataset.
const dataset = Object.values(data)
  .flatMap(palette => Object.entries(palette)
    .flatMap(([shade, color]) => ({
      input: colorToLayer(palette[500], shade),
      output: colorToLayer(color, shade),
    })))

// --- Train NN with dataset.
const statesHistory: number[] = []
const { error } = neuralNetwork.train(shuffle(dataset), {
  iterations: 1000000,
  errorThresh: 1 / 1000,
  learningRate: 0.009,
  logPeriod: 100,
  log: ({ error, iterations }) => {
    console.clear()
    statesHistory.push(error)
    if (statesHistory.length > 70) statesHistory.shift()
    consola.log(plot(statesHistory, { max: Math.max(...statesHistory), height: 5, format: x => x.toFixed(5) }))
    consola.info(`${chalk.bgGreenBright('Iteration:')} #${iterations}`)
    consola.info(`${chalk.bgRed('Error:')} ${error}`)
    data.slice(5, 8).forEach((x) => {
      logPalette(x)
      logPalette(run(x[500]))
    })
  },
})

// --- Save model to `.json` file.
const model = JSON.stringify(neuralNetwork.toJSON(), undefined, 2)
const outPath = join(__dirname, 'model.json')
const outPathRelative = relative(cwd(), outPath)
writeFileSync(outPath, model)
consola.success(`Trained and saved NN model to "${outPathRelative}" (error: ${error.toFixed(4)})`)
