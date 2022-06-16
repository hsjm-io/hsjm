import { isNotNil, mapValues, pick, validateSchema } from '@hsjm/shared'
import { Module, firebaseAdmin, firebaseFunctions, getModuleValidationSchema } from '../shared'

export interface ValidateOnWriteOptions {
  onCreateError?: 'delete' | 'transform' | 'rollback'
  onUpdateError?: 'delete' | 'transform' | 'rollback'
}

export const validateOnWrite = (collectionPath: string, module: Module, options = {} as ValidateOnWriteOptions) => firebaseFunctions
  ?.firestore
  .document(`${collectionPath}/{id}`)
  .onWrite(async(changes, context) => {
    // --- Destructure arguments & options.
    const { onCreateError, onUpdateError } = options
    const { after, before } = changes
    const valueAfter = after.data()
    const valueBefore = after.data()

    // --- Abort on deletion & avoid infinite-loops.
    if (valueAfter?.origin === 'server') return
    if (after.isEqual(before)) return
    if (!after.exists) return

    // --- Validate data.
    const schema = getModuleValidationSchema(module)
    const { isInvalid, results, value } = await validateSchema(valueAfter, schema, { context, admin: firebaseAdmin, changes })
    const valueTransformed = pick({ ...value, _error: undefined }, isNotNil)

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
