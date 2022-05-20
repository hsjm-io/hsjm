import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt'
import presetUno from '@unocss/preset-uno'
import { presetHsjm } from '../packages/unocss-preset/index'
const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
  ],
  alias: {
    '@hsjm/core': resolve(__dirname, '../packages/core/index.ts'),
    '@hsjm/shared': resolve(__dirname, '../packages/shared/index.ts'),
  },
  vueuse: {
    ssrHandlers: true,
  },
  components: [
    { path: '~/components', extensions: ['vue', 'ts'] },
  ],
  unocss: {
    include: [
      './components/**/*.ts',
      './App.vue',
    ],
    preflight: true,
    presets: [
      presetUno(),
      // @ts-expect-error: ignore
      presetHsjm(),
    ],
  },
})
