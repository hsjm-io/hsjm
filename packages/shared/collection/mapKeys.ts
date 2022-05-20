import { Key, MaybeArray } from '../types'
import { get } from './get'

interface MapKeys {
  <T>(object: Array<T>, path: MaybeArray<Key>): Record<string, T>
  <T>(object: Array<T>, iterator: (value: T, key: keyof T, array: Array<T>) => string): Record<string, T>
  <T>(object: Array<T>, iterator: any): Record<string, T>
  <T>(object: Record<string, T>, path: MaybeArray<Key>): Record<string, T>
  <T>(object: Record<string, T>, iterator: (value: T, key: keyof T, object: Record<string, T>) => string): Record<string, T>
  <T>(object: Record<string, T>, iterator: any): Record<string, T>
}

/**
 * Maps keys in an object or array.
 * @param {Array|Object} object The object or array to map keys for
 * @param {Function|string[]} iterator The iterator function or path
 * @returns {Object} The new object with mapped keys
 */
export const mapKeys: MapKeys = (object: any, iterator: any) => {
  // --- If iterator is a path, cast as getter function.
  if (typeof iterator !== 'function') {
    const path = iterator
    iterator = (value: any) => get(value, path)
  }

  // --- Map entries.
  const entries = Array.isArray(object)
    ? object.map((value, key, object) => [iterator(value, key, object), value])
    : Object.entries(object).map(([key, value]) => [iterator(value, key, object), value])

  // --- Cast as object.
  return Object.fromEntries(entries)
}
