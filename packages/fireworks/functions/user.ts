import { CloudFunction } from 'firebase-functions/v1'
import { UserRecord } from 'firebase-functions/v1/auth'
import { identityModule } from '../modules/coreIdentity'
import { FirebaseContext } from '../modules/utils'

/**
 * Creates an identity document for a new user.
 * @param {FirebaseContext} options The function options
 * @returns {CloudFunction<UserRecord>}
 */
export const createIdentityOnUserCreate = ({ admin, functions }: FirebaseContext): CloudFunction<UserRecord> => functions.auth
  .user()
  .onCreate(user => admin?.firestore().collection(identityModule.path).doc().set({
    userId: user.uid,
    avatar: user.photoURL,
    name: user.displayName,
    firstName: user.displayName?.split(' ')[0],
    lastName: user.displayName?.split(' ').slice(1).join(' '),
    contactEmails: [user.email].filter(Boolean),
    contactPhones: [user.phoneNumber].filter(Boolean),
    updatedById: user.uid,
    updatedAt: admin?.firestore.FieldValue.serverTimestamp(),
  }))

/**
 * Deletes a user's identity document when the user is deleted.
 * @param {FirebaseContext} options The function options
 * @returns {CloudFunction<UserRecord>}
 */
export const deleteIdentityOnUserDelete = ({ admin, functions }: FirebaseContext): CloudFunction<UserRecord> => functions.auth
  .user()
  .onDelete(user => admin?.firestore().collection(identityModule.path).doc(user.uid).delete())
