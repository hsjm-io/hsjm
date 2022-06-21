import { expect, it } from 'vitest'
import { rgbToInt } from './rgbToInt'

it('converts an RGB color to an RGB integer value', () => {
  expect(rgbToInt({ r: 255, g: 0, b: 0 })).toBe(0xFF0000)
  expect(rgbToInt({ r: 0, g: 255, b: 0 })).toBe(0x00FF00)
  expect(rgbToInt({ r: 0, g: 0, b: 255 })).toBe(0x0000FF)
  expect(rgbToInt({ r: 255, g: 0, b: 0, a: 0.5 })).toBe(0xFF0000)
  expect(rgbToInt({ r: 0, g: 255, b: 0, a: 0.5 })).toBe(0x00FF00)
  expect(rgbToInt({ r: 0, g: 0, b: 255, a: 0.5 })).toBe(0x0000FF)
  expect(rgbToInt({ r: 255, g: 0, b: 0, a: 0.5 }, 'rgb')).toBe(0xFF0000)
  expect(rgbToInt({ r: 0, g: 255, b: 0, a: 0.5 }, 'rgb')).toBe(0x00FF00)
  expect(rgbToInt({ r: 0, g: 0, b: 255, a: 0.5 }, 'rgb')).toBe(0x0000FF)
})

it('converts an RGBA color to an ARGB integer value', () => {
  expect(rgbToInt({ r: 255, g: 0, b: 0, a: 0.5 }, 'argb')).toBe(0x80FF0000)
  expect(rgbToInt({ r: 0, g: 255, b: 0, a: 0.5 }, 'argb')).toBe(0x8000FF00)
  expect(rgbToInt({ r: 0, g: 0, b: 255, a: 0.5 }, 'argb')).toBe(0x800000FF)
  expect(rgbToInt({ r: 255, g: 0, b: 0 }, 'argb')).toBe(0xFFFF0000)
  expect(rgbToInt({ r: 0, g: 255, b: 0 }, 'argb')).toBe(0xFF00FF00)
  expect(rgbToInt({ r: 0, g: 0, b: 255 }, 'argb')).toBe(0xFF0000FF)
})

it('converts an RGBA color to an RGBA integer value', () => {
  expect(rgbToInt({ r: 255, g: 0, b: 0, a: 0.5 }, 'rgba')).toBe(0xFF000080)
  expect(rgbToInt({ r: 0, g: 255, b: 0, a: 0.5 }, 'rgba')).toBe(0x00FF0080)
  expect(rgbToInt({ r: 0, g: 0, b: 255, a: 0.5 }, 'rgba')).toBe(0x0000FF80)
  expect(rgbToInt({ r: 255, g: 0, b: 0 }, 'rgba')).toBe(0xFF0000FF)
  expect(rgbToInt({ r: 0, g: 255, b: 0 }, 'rgba')).toBe(0x00FF00FF)
  expect(rgbToInt({ r: 0, g: 0, b: 255 }, 'rgba')).toBe(0x0000FFFF)
})

it('clamps color channels that are out of range', () => {
  expect(rgbToInt({ r: -100, g: 0, b: 0 })).toBe(0)
  expect(rgbToInt({ r: 0, g: -100, b: 0 })).toBe(0)
  expect(rgbToInt({ r: 0, g: 0, b: -100 })).toBe(0)
  expect(rgbToInt({ r: 300, g: 0, b: 0 })).toBe(0xFF0000)
  expect(rgbToInt({ r: 0, g: 300, b: 0 })).toBe(0x00FF00)
  expect(rgbToInt({ r: 0, g: 0, b: 300 })).toBe(0x0000FF)
})

it('clamps alpha channels that are out of range', () => {
  expect(rgbToInt({ r: 255, g: 0, b: 0, a: -1 }, 'argb')).toBe(0x00FF0000)
  expect(rgbToInt({ r: 0, g: 255, b: 0, a: -1 }, 'argb')).toBe(0x0000FF00)
  expect(rgbToInt({ r: 0, g: 0, b: 255, a: -1 }, 'argb')).toBe(0x000000FF)
  expect(rgbToInt({ r: 255, g: 0, b: 0, a: 2 }, 'argb')).toBe(0xFFFF0000)
  expect(rgbToInt({ r: 0, g: 255, b: 0, a: 2 }, 'argb')).toBe(0xFF00FF00)
  expect(rgbToInt({ r: 0, g: 0, b: 255, a: 2 }, 'argb')).toBe(0xFF0000FF)
})
