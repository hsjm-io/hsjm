/* eslint-disable @typescript-eslint/consistent-type-imports */
export type FirestoreReference<T = any> = typeof import('firebase-admin') extends undefined
  ? import('firebase/compat/app').default.firestore.DocumentReference<T>
  : import('firebase-admin/firestore').DocumentReference<T>

interface FirebaseContext {
  admin: typeof import('firebase-admin')
}

export const toFirestoreReference = (id: string, path: string, context: FirebaseContext) =>
  context.admin.firestore().collection(path).doc(id)

export const toFirestoreReferenceArray = (ids: string[], path: string, context: FirebaseContext) => {
  const firestore = context.admin.firestore()
  return firestore ? ids.map(id => firestore.collection(path).doc(id)) : []
}

export const documentExists = async(path: string, id: string, context: FirebaseContext) => {
  const firestore = context.admin.firestore()
  const document = await firestore.collection(path).doc(id).get()
  return document.exists
}
