/**
 * Convert a value to a `number`
 * - `number` will be returned as is
 * - `string` will be converted to a number, 0 if it can't be converted
 * - `boolean` will be converted to 1 or 0 (supports `Boolean` objects)
 * - `bigint` will be clamped and converted to a number
 * @param value The value to convert
 * @returns {number} The converted value
 * @example
 * toNumber(42) // 42
 * toNumber(42n) // 42
 * toNumber(true) // 1
 * toNumber('42') // 42
 * toNumber('foo') // 0
 */
export const toNumber = (value: any): number => {
  // --- If the value is a number, return it
  if (typeof value === 'number')
    return Number.isNaN(value) ? 0 : value

  // --- If the value is a string, convert it to a number
  if (typeof value === 'string') {
    value = Number(value)
    return Number.isNaN(value) ? 0 : value
  }

  // --- If the value is a [bB]oolean, convert it to 1 or 0
  if (typeof value === 'boolean') return value ? 1 : 0
  if (value instanceof Boolean) return value.valueOf() ? 1 : 0

  // --- If the value is a bigint, convert it to a number
  if (typeof value === 'bigint') return Number(value)

  // --- Fallback to 0
  return 0
}
