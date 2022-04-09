/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
import { hexToHsl, hslToHex } from '@hsjm/shared'

export const logPalette = (palette: Record<string, string>) => {
  const string = Object.values(palette)
    .map(c => require('chalk').bgHex(c).black(c.toUpperCase()))
    .join('')
  console.log(string)
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
