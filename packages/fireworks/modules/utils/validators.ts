import { FirebaseContext, FirestoreReference } from '../types'

/**
 * Check if value is a Firestore user id
 * @param this Validation context
 * @param id User id to check
 * @returns true if value is a Firestore user id
 */
export const isFirestoreUserId = async function(this: FirebaseContext, id: string) {
  const user = await this.admin.auth().getUser(id)
  return !!user
}

/**
 * Check if values are a Firestore user ids
 * @param this Validation context
 * @param ids User ids to check
 * @returns true if values are a Firestore user ids
 */
export const isFirestoreUserIds = async function(this: FirebaseContext, ids: string[]) {
  const promises = ids
    .filter(id => typeof id === 'string' && id.length > 0)
    .map(id => isFirestoreUserId.bind(this)(id))
  const results = await Promise.all(promises)
  return results.every(Boolean)
}

/**
 * Convert a Firestore user id or Reference to it's user's identity Reference
 * @param this Validation context
 * @param idOrReference Id or Reference to a Firestore user
 * @returns Reference to the user's identity
 */
export const toFirestoreIdentity = async function(this: FirebaseContext, idOrReference: string | FirestoreReference) {
  const idString = typeof idOrReference === 'string' ? idOrReference : idOrReference.id
  const snapshot = await this.admin.firestore().collection('identity').where('userId', '==', idString).get()
  return snapshot.docs[0].ref
}

/**
 * Convert a Firestore id to it's Reference given a collection path.
 * @param this Validation context
 * @param id Id to convert
 * @param path Path to the collection
 * @returns Document Reference
 */
export const toFirestoreReference = function(this: FirebaseContext, id: string, path: string) {
  return this.admin.firestore().collection(path).doc(id)
}

/**
 * Check if id exists in Firestore
 * @param this Validation context
 * @param id Id to check
 * @param path Path to the collection
 * @returns true if id or Reference exists in Firestore
 */
export const isFirestoreId = async function(this: FirebaseContext, id: string, path: string) {
  const snapshot = await this.admin.firestore().collection(path).doc(id).get()
  return snapshot.exists
}

/**
 * Check if Reference exists in Firestore
 * @param this Validation context
 * @param reference Reference to check
 * @param path Path to the collection
 * @returns true if id or Reference exists in Firestore
 */
export const isFirestoreReference = function(this: FirebaseContext, reference: FirestoreReference, path: string) {
  return isFirestoreId.bind(this)(reference?.id, path)
}
