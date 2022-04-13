import { Preset } from 'unocss'
import { Theme } from '@unocss/preset-mini'
import { rules } from './rules'
import { theme } from './theme'
import { variants } from './variants'
import { shortcuts } from './shortcuts'

export interface PresetHsjmOptions {

}

export const presetHsjm = (options = {} as PresetHsjmOptions): Preset<Theme> => ({
  name: '@hsjm/unocss-preset',
  theme,
  rules,
  variants,
  shortcuts,
  options,
})
