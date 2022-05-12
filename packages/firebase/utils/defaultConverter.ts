import { pick } from '@hsjm/shared'
import { DocumentData, FirestoreDataConverter, deleteDoc, setDoc } from 'firebase/firestore'
import { useFirebase } from '../useFirebase'

export const defaultConverter: FirestoreDataConverter<DocumentData> = {
  fromFirestore: (snapshot) => {
    const data = snapshot.data()
    const id = snapshot.id
    return {
      id,
      ...data,
      async $erase() { return await deleteDoc(snapshot.ref) },
      async $save() { return await setDoc(snapshot.ref, this) },
    }
  },

  toFirestore: (data) => {
    const { auth } = useFirebase()
    return {
      createdById: auth.currentUser?.uid,
      ...pick(data, x => typeof x !== 'function'),
      origin: 'client',
      updatedById: auth.currentUser?.uid,
    }
  },
}
