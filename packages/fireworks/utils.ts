import { firestoreId } from '@hsjm/shared'
import { boolean, object, string } from 'yup'

export const reference = object({
  id: string().required().matches(firestoreId, 'invalid-fires'),
  exists: boolean().required(),
})

export const getReference = async(path: string, id: string) => {
  const admin = await import('firebase-admin')
  const document = await admin.firestore().collection(path).doc(id).get()
  return document.exists ? document.ref : undefined
}

export const documentExists = async(path: string, id: string) => {
  const admin = await import('firebase-admin')
  const document = await admin.firestore().collection(path).doc(id).get()
  return document.exists
}
