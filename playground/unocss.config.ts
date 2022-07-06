import { defineConfig } from 'unocss'
import presetUno from '@unocss/preset-uno'
import { presetHsjm } from '../packages/unocss-preset/index'

export default defineConfig({
  presets: [
    presetUno(),
    // @ts-expect-error: ignore
    presetHsjm(),
  ],
})
