import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt'
import presetUno from '@unocss/preset-uno'
import { presetHsjm } from '../packages/unocss-preset'
const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
  ],
  alias: {
    '@hsjm/core': resolve(__dirname, '../packages/core'),
    '@hsjm/shared': resolve(__dirname, '../packages/shared'),
    '@hsjm/unocss-preset': resolve(__dirname, '../packages/unocss-preset'),
  },
  vueuse: {
    ssrHandlers: true,
  },
  unocss: {
    attributify: true,
    preflight: true,
    presets: [
      presetUno(),
      // @ts-expect-error: ignore
      presetHsjm(),
    ],
  },
})
