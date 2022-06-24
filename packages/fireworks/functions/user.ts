import { CloudFunction } from 'firebase-functions/v1'
import { UserRecord } from 'firebase-functions/v1/auth'
import { identitySchema } from '../modules'
import { FirebaseContext } from '../shared'

/**
 * Creates an identity document for a new user.
 * @param {FirebaseContext} options The function options
 * @returns {CloudFunction<UserRecord>}
 */
export const createIdentityOnUserCreate = ({ admin, functions }: FirebaseContext): CloudFunction<UserRecord> => functions.auth
  .user()
  .onCreate(user => admin?.firestore().collection(identitySchema.collection).doc().set({
    origin: 'server',
    userId: user.uid,
    avatar: user.photoURL,
    name: user.displayName,
    contactEmails: [user.email].filter(Boolean),
    contactPhones: [user.phoneNumber].filter(Boolean),
  }),
  )

/**
 * Deletes a user's identity document when the user is deleted.
 * @param {FirebaseContext} options The function options
 * @returns {CloudFunction<UserRecord>}
 */
export const deleteIdentityOnUserDelete = ({ admin, functions }: FirebaseContext): CloudFunction<UserRecord> => functions.auth
  .user()
  .onDelete(user => admin?.firestore().collection(identitySchema.collection).doc(user.uid).delete())
