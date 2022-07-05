import { FirebaseContext, FirestoreReference } from '../types'

/**
 * Check if value is a Firestore user id
 * @param id Value to check
 * @param  _ Ignored
 * @param context Validation context
 * @returns true if value is a Firestore user id
 */
export const isFirestoreUserId = (id: string, _: any, { admin }: FirebaseContext) => admin
  .auth()
  .getUser(id)
  .then(user => !!user)

/**
 * Check if values are a Firestore user ids
 * @param ids Value to check
 * @param  _ Ignored
 * @param context Validation context
 * @returns true if values are a Firestore user ids
 */
export const isFirestoreUserIds = async(ids: string[], _: any, context: FirebaseContext) => {
  const promises = ids
    .filter(id => typeof id === 'string' && id.length > 0)
    .map(id => isFirestoreUserId(id, _, context))
  const results = await Promise.all(promises)
  return results.every(Boolean)
}

/**
 * Convert a Firestore user id or Reference to it's user's identity Reference
 * @param idOrReference Id or Reference to a Firestore user
 * @param  _ Ignored
 * @param context Validation context
 * @returns Reference to the user's identity
 */
export const toFirestoreIdentity = (idOrReference: string | FirestoreReference, _: any, { admin }: FirebaseContext) => admin
  .firestore()
  .collection('identity')
  .where('userId', '==', typeof idOrReference === 'string' ? idOrReference : idOrReference.id)
  .get()
  .then(snapshot => snapshot.docs[0].ref)

/**
 * Convert a Firestore id to it's Reference given a collection path.
 * @param id Id to convert
 * @param path Path to the collection
 * @param context Validation context
 * @returns Document Reference
 */
export const toFirestoreReference = (id: string, path: string, { admin }: FirebaseContext) => admin
  .firestore()
  .collection(path)
  .doc(id)

/**
 * Check if id exists in Firestore
 * @param id Id to check
 * @param path Path to the collection
 * @param context Validation context
 * @returns true if id or Reference exists in Firestore
 */
export const isFirestoreId = (id: string, path: string, { admin }: FirebaseContext) => admin
  .firestore()
  .collection(path)
  .doc(id)
  .get()
  .then(snapshot => snapshot.exists)

/**
 * Check if Reference exists in Firestore
 * @param reference Reference to check
 * @param path Path to the collection
 * @param context Validation context
 * @returns true if id or Reference exists in Firestore
 */
export const isFirestoreReference = (reference: FirestoreReference, path: string, context: FirebaseContext) =>
  isFirestoreId(reference?.id, path, context)
