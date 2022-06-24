import chalk from 'chalk'
import consola from 'consola'
import { hexToHsl, hslToHex } from '@hsjm/shared'

export const logPalette = (palette: Record<string, string>) => {
  const string = Object.values(palette)
    .map(c => chalk.bgHex(c).black(c.toUpperCase()))
    .join('')
  consola.log(string)
}

export const colorToLayer = (color: string, shade: string) => {
  const { h, s, l } = hexToHsl(color)
  return {
    h: h / 360,
    s: s / 100,
    l: l / 100,
    shade: (+shade + 50) / 900,
  }
}

export const layerToColor = ({ h, s, l }: Record<string, number>) =>
  hslToHex({
    h: h * 360,
    s: s * 100,
    l: l * 100,
  })
