import { isNotNil, mapValues, pick, validateSchema } from '@hsjm/shared'
import { FirebaseContext, Module, getModuleValidationSchema } from '../shared'

export interface ValidateOnWriteOptions extends FirebaseContext {
  onCreateError?: 'delete' | 'transform' | 'rollback'
  onUpdateError?: 'delete' | 'transform' | 'rollback'
}

/**
 * Validates data written to Firestore according to a provided schema.
 * @param {Module} module The module to validate data for
 * @param {ValidateOnWriteOptions} options Options for the function
 * @returns {CloudFunction<Change<DocumentSnapshot>>}
 */
export const validateOnWrite = (module: Module, options: ValidateOnWriteOptions) => {
  // --- Initialize variables.
  const { admin, functions, onCreateError, onUpdateError } = options
  const collection = module.collection
  const schema = getModuleValidationSchema(module)

  // --- Instantiate Firebase `onWrite` function.
  return functions.firestore
    .document(`${collection}/{id}`)
    .onWrite(async(changes, context) => {
      // --- Destructure arguments & options.
      const { after, before } = changes
      const valueAfter = after.data()
      const valueBefore = after.data()

      // --- Abort on deletion & avoid infinite-loops.
      if (valueAfter?.origin === 'server') return
      if (after.isEqual(before)) return
      if (!after.exists) return

      // --- Validate data.
      const { isInvalid, results, value } = await validateSchema(valueAfter, schema, { context, admin, functions, changes })
      const valueTransformed = pick({ ...value, _error: undefined }, isNotNil)

      // --- Collect errors.
      const _errors = mapValues(
        pick(results, 'isInvalid'),
        x => x.results.map(x => x.errorMessage),
      )

      // --- Handle invalid.
      const onError = before.exists ? onUpdateError : onCreateError
      if (isInvalid) {
        if (onError === 'delete') return after.ref.delete()
        if (onError === 'rollback') return after.ref.set({ ...valueBefore, origin: 'server', _errors })
        if (onError === 'transform') return after.ref.set({ ...valueTransformed, origin: 'server', _errors })
        return after.ref.set({ ...valueAfter, origin: 'server', _errors })
      }

      // --- Apply transformations.
      after.ref.set({ ...valueTransformed, origin: 'server' })
    })
}
