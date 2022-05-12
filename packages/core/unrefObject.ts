/* eslint-disable unicorn/prevent-abbreviations */
import { MaybeRef } from '@vueuse/shared'
import { unref } from 'vue-demi'

export interface UnrefValues {
  <T>(value: Array<MaybeRef<T>>): Array<T>
  <T, K extends string | number | symbol>(value: Record<K, MaybeRef<T>>): Record<K, T>
}

/**
 * Unref an object and its properties.
 * @param value Object to unref.
 */
export const unrefValues: UnrefValues = (value: any): any => (
  Array.isArray(value)
    ? value.map(unref)
    : Object.fromEntries(
      Object.entries(unref(value))
        .map(([k, v]) => [k, unref(v)]),
    )
)
