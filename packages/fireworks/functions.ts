/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Schema, validateSchema } from '@hsjm/shared'

export const firebaseAdmin = () => require('firebase-admin').default as typeof import('firebase-admin')
export const firebaseFunctions = () => require('firebase-functions').default as typeof import('firebase-functions')

export const validateOnWrite = (collectionPath: string, schema: Schema) => firebaseFunctions().firestore
  .document(`${collectionPath}/{id}`)
  .onWrite(async(changes, context) => {
    // --- Abort on no changes.
    if (changes.after.isEqual(changes.before)) return
    if (!changes.after.exists) return

    // --- Validate data.
    const dataAfter = changes.after.data()
    const dataBefore = changes.after.data()
    const result = await validateSchema(dataAfter, schema, context)

    // --- Apply transformation if valid, or abort if invalid.
    if (result.isValid) changes.after.ref.set(result.value)
    else if (!dataBefore) changes.after.ref.delete()
    else changes.after.ref.set(dataBefore)
  })

/**
 * Return functions that creates a Firestore record assigned to the user.
 * @param extend Function to extend the document.
 * @returns Firebase function instance.
 */
export const createIdentityOnUserCreate = (handler?: Function) => firebaseFunctions().auth
  .user()
  .onCreate((user, context) =>
    firebaseAdmin().firestore().collection('identity').doc().set({
      userId: user.uid,
      portraitUrl: user.photoURL,
      name: user.displayName,
      contactEmails: [user.email],
      contactPhones: [user.phoneNumber],
      ...(handler ? handler(user, context) : {}),
    }),
  )

export const deleteIdentityOnUserDelete = () => firebaseFunctions().auth
  .user()
  .onDelete(user => firebaseAdmin().firestore().collection('identity').doc(user.uid).delete())
