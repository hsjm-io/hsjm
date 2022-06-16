import { firebaseAdmin, firebaseFunctions } from '../shared'

/**
 * Return functions that creates a Firestore record assigned to the user.
 * @param extend Function to extend the document.
 * @returns Firebase function instance.
 */
export const createIdentityOnUserCreate = (collectionPath: string) => firebaseFunctions
  ?.auth
  .user()
  .onCreate(user =>
    firebaseAdmin?.firestore().collection(collectionPath).doc().set({
      origin: 'server',
      userId: user.uid,
      avatar: user.photoURL,
      name: user.displayName,
      contactEmails: [user.email].filter(Boolean),
      contactPhones: [user.phoneNumber].filter(Boolean),
    }),
  )

export const deleteIdentityOnUserDelete = (collectionPath: string) => firebaseFunctions
  ?.auth
  .user()
  .onDelete(user => firebaseAdmin?.firestore().collection(collectionPath).doc(user.uid).delete())
