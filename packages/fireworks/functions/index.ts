import { Schema, validateSchema } from '@hsjm/shared'
import admin from 'firebase-admin'
import functions from 'firebase-functions'

export const validateOnWrite = (collectionPath: string, schema: Schema) => functions.firestore
  .document(`${collectionPath}/{id}`)
  .onWrite(async(changes, context) => {
    // --- Abort on no changes.
    if (changes.after.isEqual(changes.before)) return
    if (!changes.after.exists) return

    // --- Validate data.
    const dataAfter = changes.after.data()
    const dataBefore = changes.after.data()
    const result = await validateSchema(dataAfter, schema, { context, admin })

    // --- Apply transformation if valid, or abort if invalid.
    if (result.isValid) changes.after.ref.set({ ...result.value, errors: result.errors })
    else if (!dataBefore) changes.after.ref.delete()
    else changes.after.ref.set({ ...dataBefore, errors: result.errors })
  })

/**
 * Return functions that creates a Firestore record assigned to the user.
 * @param extend Function to extend the document.
 * @returns Firebase function instance.
 */
export const createIdentityOnUserCreate = (handler?: Function) => functions.auth
  .user()
  .onCreate((user, context) =>
    admin.firestore().collection('identity').doc().set({
      userId: user.uid,
      portraitUrl: user.photoURL,
      name: user.displayName,
      contactEmails: [user.email],
      contactPhones: [user.phoneNumber],
      ...(handler ? handler(user, context) : {}),
    }),
  )

export const deleteIdentityOnUserDelete = () => functions.auth
  .user()
  .onDelete(user => admin.firestore().collection('identity').doc(user.uid).delete())
