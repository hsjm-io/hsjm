//--- Import dependencies
import { mergeWith, isArray } from "lodash-es"

/**
 * Merge objects together and concat their properties if theyare arrays.
 * @param obj The destination object.
 * @param src The source object.
 */
 export function compose<TObject, TSource>(obj: TObject, src: TSource): TSource & TObject {

  // --- Customizer function that merges or concat values.
  function customizer(objValue: any, srcValue: any) {
    if (isArray(objValue))
      return objValue.concat(srcValue)
  }

  // --- Return merged the objects.
  return mergeWith(obj, src, customizer)
}
