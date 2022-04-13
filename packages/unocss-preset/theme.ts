import { Theme } from '@unocss/preset-mini'
import { brands } from './constants'

const colorsBrand = Object.entries(brands)
  .map(([key, brand]) => [key, `#${brand.colors[0]}`])

export const theme: Theme = {
  easing: {
    bounce: 'cubic-bezier(0.29, 2.81, 0.29, -0.03)',
  },

  colors: {
    ...Object.fromEntries(colorsBrand),
  },
}
