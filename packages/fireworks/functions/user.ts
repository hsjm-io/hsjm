import admin from 'firebase-admin'
import functions from 'firebase-functions'

/**
 * Return functions that creates a Firestore record assigned to the user.
 * @param extend Function to extend the document.
 * @returns Firebase function instance.
 */
export const createIdentityOnUserCreate = (collectionPath: string) => functions.auth
  .user()
  .onCreate(user =>
    admin.firestore().collection(collectionPath).doc().set({
      userId: user.uid,
      portraitUrl: user.photoURL,
      name: user.displayName,
      contactEmails: [user.email].filter(Boolean),
      contactPhones: [user.phoneNumber].filter(Boolean),
    }),
  )

export const deleteIdentityOnUserDelete = (collectionPath: string) => functions.auth
  .user()
  .onDelete(user => admin.firestore().collection(collectionPath).doc(user.uid).delete())
