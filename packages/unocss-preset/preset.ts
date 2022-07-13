import { rules } from './rules'
import { theme } from './theme'
import { variants } from './variants'
import { shortcuts } from './shortcuts'

export interface PresetHsjmOptions {

}

export const presetHsjm = (options = {} as PresetHsjmOptions) => ({
  name: '@hsjm/unocss-preset',
  theme,
  rules,
  variants,
  shortcuts,
  options,
})
