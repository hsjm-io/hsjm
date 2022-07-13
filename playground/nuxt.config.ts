import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  ssr: true,
  target: 'static',
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
  ],
  vite: {
    build: {
      minify: false,
    },
    optimizeDeps: {
      exclude: [
        '@hsjm/shared',
        '@hsjm/core',
      ],
    },
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
