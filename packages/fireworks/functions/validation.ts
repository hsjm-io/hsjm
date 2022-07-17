import { isNotNil, isNotUndefined, mapValues, pick, validateSchema } from '@hsjm/shared'
import { FirebaseContext, Module, getModuleValidationSchema } from '../modules'
import { createSignature } from './utils'

export interface ValidateOnWriteOptions extends FirebaseContext {
  onCreateError?: 'rollback' | 'delete'
  onUpdateError?: 'rollback' | 'delete'
}

/**
 * Validates data written to Firestore according to a provided schema.
 * @param {Module} module The module to validate data for
 * @param {ValidateOnWriteOptions} options Options for the function
 * @returns {CloudFunction} A Firebase Cloud Function instance
 */
export const validateOnWrite = (module: Module, options: ValidateOnWriteOptions) => {
  // --- Initialize variables.
  const { admin, functions, onCreateError, onUpdateError } = options
  const schema = getModuleValidationSchema(module)

  // --- Instantiate Firebase `onWrite` function.
  return functions.firestore
    .document(`${module.path}/{id}`)
    .onWrite(async(changes, context) => {
      // --- Destructure arguments & options.
      let value = changes.after.data()
      const before = changes.before.data()

      // --- Abort on deletion & avoid infinite-loops.
      if (!value) return
      const __signature = createSignature(value)
      if (createSignature(value) === value.__signature)
        return console.warn(`[validateOnWrite] Updated and validated document "${value.id}", signature: ${__signature})`)

      // --- Validate data.
      const validationContext = { context, admin, functions, changes, value, before }
      const { isValid, errors, value: transformedValue } = await validateSchema(value, schema, validationContext)
      value = pick(transformedValue, isNotNil)

      // --- Handle validation error.
      if (!isValid) {
        const onError = before ? onUpdateError : onCreateError
        const __errors = mapValues(pick(errors, isNotUndefined) as Record<string, Error>, 'message')
        switch (onError) {
          // --- Delete document if validation error.
          case 'delete': {
            value.ref.delete()
            console.warn(`[validateOnWrite] Deleted document "${value.id}" with errors: ${JSON.stringify(__errors)}`)
            return
          }

          // --- Rollback document if validation error.
          case 'rollback': value = { ...before, __errors }; break

          // --- Transform anyway.
          default: value = { ...value, __errors }; break
        }
      }

      // --- Delete `__error` property.
      else { delete value.__errors }

      // --- Update document.
      changes.after.ref.set({ ...value, __signature }, { merge: false })
    })
}
