import { Schema, isNotNil, pick, validateSchema } from '@hsjm/shared'
import admin from 'firebase-admin'
import functions from 'firebase-functions'

export const validateOnWrite = (collectionPath: string, schema: Schema) => functions.firestore
  .document(`${collectionPath}/{id}`)
  .onWrite(async(changes, context) => {
    // --- Destructure arguments.
    const { after, before } = changes
    const valueAfter = after.data()
    const valueBefore = after.data()

    // --- Abort on deletion & avoid infinite-loops.
    if (valueAfter?._origin === 'server') return
    if (after.isEqual(before)) return
    if (!after.exists) return

    // --- Validate data.
    const { isValid, isInvalid, errors, value } = await validateSchema(valueAfter, schema, { context, admin, changes })

    const newValue = pick({
      ...(isValid ? value : valueBefore),
      _origin: 'server',
      _errors: isInvalid ? errors : undefined,
    }, isNotNil)

    // --- Delete record if invalid.
    if (isInvalid && !before.exists) return after.ref.delete()

    // --- Apply transformations.
    after.ref.set(newValue)
  })
