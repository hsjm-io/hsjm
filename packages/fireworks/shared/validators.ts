import { FirebaseContext } from './types'

export const isUserId = (id: string, _: any, { admin }: FirebaseContext) => admin
  .auth()
  .getUser(id)
  .then(user => !!user)

export const toFirestoreIdentity = (id: string, _: any, { admin }: FirebaseContext) => admin
  .firestore()
  .collection('identity')
  .where('userId', '==', id)
  .get()
  .then(snapshot => snapshot.docs[0].ref)

export const toFirestoreReference = (id: string, path: string, { admin }: FirebaseContext) => admin
  .firestore()
  .collection(path)
  .doc(id)

export const toFirestoreReferenceArray = (ids: string[], path: string, context: FirebaseContext) =>
  ids.map(id => toFirestoreReference(id, path, context))

export const isFirestoreReference = (id: string, path: string, { admin }: FirebaseContext) => admin
  .firestore()
  .collection(path)
  .doc(id)
  .get()
  .then(snapshot => snapshot.exists)
