import { isBrowser } from '@hsjm/shared'

/* eslint-disable @typescript-eslint/consistent-type-imports */
export type Firestore = typeof import('firebase-admin') extends undefined
  ? import('firebase/compat/app').default.firestore.Firestore
  : import('firebase-admin/firestore').Firestore

export type FirestoreReference<T = any> = typeof import('firebase-admin') extends undefined
  ? import('firebase/compat/app').default.firestore.DocumentReference<T>
  : import('firebase-admin/firestore').DocumentReference<T>

let firestore: Firestore | undefined

const getFirestore = async() => {
  if (firestore) return firestore
  // @ts-expect-error: Is valid.
  firestore = isBrowser
    ? await import('firebase/compat/app').then(x => x.default.firestore())
    : await import('firebase-admin/firestore').then(x => x.getFirestore())
  return firestore
}

export const toFirestoreReference = async(id: string, path: string) => {
  const firestore = await getFirestore()
  return firestore?.collection(path).doc(id)
}

export const toFirestoreReferenceArray = async(ids = [] as string[], path: string) => {
  const firestore = await getFirestore()
  return firestore ? ids.map(id => firestore.collection(path).doc(id)) : []
}

export const documentExists = async(path: string, id: string) => {
  const firestore = await getFirestore()
  const document = await firestore?.collection(path).doc(id).get()
  return document?.exists
}
