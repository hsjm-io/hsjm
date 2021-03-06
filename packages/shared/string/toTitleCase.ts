import { tokenize } from './tokenize'

/**
 * Converts a string to title case.
 * @param {string} value The string to convert
 * @returns {string} The converted string
 * @example
 * ```
 * toCamelCase('foo_bar') // returns 'Foo Bar'
 * toCamelCase('FOO_BAR') // returns 'Foo Bar'
 * ```
 */
export const toTitleCase = (value: string): string => tokenize(value)
  .map(token => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
  .join(' ')
