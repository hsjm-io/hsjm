import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt'
const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
  ],
  alias: {
    '@hsjm/core': resolve(__dirname, '../packages/core'),
    '@hsjm/shared': resolve(__dirname, '../packages/shared'),
  },
  vueuse: {
    ssrHandlers: true,
  },
  components: [
    { path: '~/components', extensions: ['vue', 'ts'] },
  ],
  unocss: {
    preflight: true,
    configFile: './unocss.config.ts',
  },
})
