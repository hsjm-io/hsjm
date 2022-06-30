import { FirebaseContext, FirestoreReference } from './types'

/**
 * Check if value is an id or a Reference to a Firestore user
 * @param idOrReference Value to check
 * @param  _ Ignored
 * @param context Validation context
 * @returns true if value is an id or a Reference to a Firestore user
 */
export const isFirestoreUser = (idOrReference: string | FirestoreReference, _: any, { admin }: FirebaseContext) => admin
  .auth()
  .getUser(typeof idOrReference === 'string' ? idOrReference : idOrReference.id)
  .then(user => !!user)

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
 * Check if id or Reference exists in Firestore
 * @param idOrReference Id or Reference to check
 * @param path Path to the collection
 * @param context Validation context
 * @returns true if id or Reference exists in Firestore
 */
export const isFirestoreReference = (idOrReference: string | FirestoreReference, path: string, { admin }: FirebaseContext) => admin
  .firestore()
  .collection(path)
  .doc(typeof idOrReference === 'string' ? idOrReference : idOrReference.id)
  .get()
  .then(snapshot => snapshot.exists)
