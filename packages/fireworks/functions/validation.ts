import { isNotNil, isNotUndefined, mapValues, pick, validateSchema } from '@hsjm/shared'
import { Change, CloudFunction } from 'firebase-functions/v1'
import { DocumentSnapshot } from 'firebase/firestore'
import { FirebaseContext, Module, getModuleValidationSchema } from '../modules/utils'

export interface ValidateOnWriteOptions extends FirebaseContext {
  onCreateError?: 'rollback' | 'delete'
  onUpdateError?: 'rollback' | 'delete'
}

/**
 * Validates data written to Firestore according to a provided schema.
 * @param {Module} module The module to validate data for
 * @param {ValidateOnWriteOptions} options Options for the function
 * @returns {CloudFunction<Change<DocumentSnapshot>>}
 */
export const validateOnWrite = <T = DocumentSnapshot>(module: Module, options: ValidateOnWriteOptions): CloudFunction<Change<T>> => {
  // --- Initialize variables.
  const { admin, functions, onCreateError, onUpdateError } = options
  const schema = getModuleValidationSchema(module)

  // --- Instantiate Firebase `onWrite` function.
  return functions.firestore
    .document(`${module.path}/{id}`)
    .onWrite(async(changes, context) => {
      // --- Destructure arguments & options.
      const { after, before } = changes
      const valueAfter = after.data()
      const valueBefore = after.data()

      // --- Abort on deletion & avoid infinite-loops.
      if (valueAfter?.__origin === 'server') return
      if (after.isEqual(before)) return
      if (!after.exists) return

      // --- Validate data.
      const { isValid, errors, value } = await validateSchema(valueAfter, schema, {
        context,
        admin,
        functions,
        changes,
        value: valueAfter,
        before: valueBefore,
      })
      const valueTransformed = pick(value, isNotNil)

      // --- Handle invalid.
      const onError = before.exists ? onUpdateError : onCreateError
      if (!isValid) {
        const __errors = mapValues(pick(errors, isNotUndefined) as Record<string, Error>, 'message')
        switch (onError) {
          case 'delete': return after.ref.delete()
          case 'rollback': return after.ref.set({ ...valueBefore, __origin: 'server', __errors })
          default: return after.ref.set({ ...valueAfter, __origin: 'server', __errors })
        }
      }

      // --- Delete __error property.
      else if (valueTransformed.__error) { delete valueTransformed.__error }

      // --- Apply transformations.
      after.ref.set({ ...valueTransformed, __origin: 'server' })
    }) as unknown as CloudFunction<Change<T>>
}
