import { Preset, Rule, Shortcut, Variant } from 'unocss'
import { Theme } from '@unocss/preset-mini'
import rules from './rules'
import variants from './variants'
import shortcuts from './shortcuts'

export const presetHsjm = (): Preset<Theme> => ({
  name: 'hsjm',
  rules: rules as Rule[],
  variants: variants as Variant[],
  shortcuts: shortcuts as Shortcut[],
})
