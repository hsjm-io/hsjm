//--- Import dependencies
import { mergeWith, isArray, isObjectLike, concat, merge, isBoolean } from 'lodash'
import { ComputedRef, unref } from 'vue-demi'
import { MaybeRef, reactify } from '@vueuse/core'
import { or } from '@vueuse/shared'
import type { Union } from 'ts-toolbelt'

/**
 * 
 * @param composables 
 */
export function compose<T extends object[]>(composables: T): Union.Merge<T[number]>
export function compose(composables: object[]) {

  // --- Customizer function that merges or concat values.
  function customizer<TObject, TSource>(objValue: MaybeRef<TObject>, srcValue: MaybeRef<TSource>) {

    if (isArray(unref(objValue)))
      return reactify(concat)(objValue, srcValue) as ComputedRef<(TObject | TSource)[]>

    if (isObjectLike(unref(objValue)))
      return reactify(merge)(objValue, srcValue) as ComputedRef<TObject & TSource>

    if (isBoolean(unref(objValue)))
      return or(srcValue, objValue)

    return srcValue ?? objValue
  }

  // --- Return merged the objects.
  return mergeWith({}, ...composables, customizer)
}

type Composable = (o: object) => { attributes?: object, classes?: object, [x: string]: any }
type ComposedParameters<T extends Composable[]> = Union.Merge<Parameters<T[number]>[0]>
type ComposedReturnType<T extends Composable[]> = Union.Merge<ReturnType<T[number]>>

export function createComposition<T extends Composable[]>(composables?: T): (options: ComposedParameters<T>) => ComposedReturnType<T>
export function createComposition(composables: Function[]) {
  return (options: any) => compose(composables.map(fn => fn.call(undefined, options)))
}
