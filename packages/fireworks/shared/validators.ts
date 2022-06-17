/* eslint-disable @typescript-eslint/consistent-type-imports */
export type FirestoreReference<T = any> = import('firebase/compat/app').default.firestore.DocumentReference<T>

interface FirebaseContext {
  admin: typeof import('firebase-admin')
  context: import('firebase-functions').EventContext
}

export const isUserId = (id: string, _: any, context: FirebaseContext) =>
  context.admin.auth().getUser(id).then(user => !!user)

export const toFirestoreIdentity = (id: string, _: any, context: FirebaseContext) =>
  context.admin.firestore().collection('identity').where('userId', '==', id).get()
    .then(snapshot => snapshot.docs[0].ref)

export const toFirestoreReference = (id: string, path: string, context: FirebaseContext) =>
  context.admin.firestore().collection(path).doc(id)

export const toFirestoreReferenceArray = (ids: string[], path: string, context: FirebaseContext) => {
  const firestore = context.admin.firestore()
  return firestore ? ids.map(id => firestore.collection(path).doc(id)) : []
}

export const documentExists = async(id: string, path: string, context: FirebaseContext) =>
  context.admin.firestore().collection(path).doc(id).get().then(snapshot => snapshot.exists)