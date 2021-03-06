import { colorTransform } from './colorTransform'

/**
 * Takes a hexadecimal color and a number and returns a new hexadecimal color with the saturation increased by that number.
 * @param {string} hex A hexadecimal color
 * @param {number} n A number
 * @returns {string} A new hexadecimal color
 */
export const colorSaturate = (hex: string, n: number): string => colorTransform(hex, { s: x => x * n })
