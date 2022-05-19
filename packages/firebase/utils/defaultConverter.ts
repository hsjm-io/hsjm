import { omit } from '@hsjm/shared'
import { DocumentData, FirestoreDataConverter } from 'firebase/firestore'
import { useFirebase } from '../useFirebase'

export const toFirestore: FirestoreDataConverter<DocumentData>['toFirestore'] = data => ({
  ...omit(data, ['origin', 'id']),
  updatedById: useFirebase().auth.currentUser?.uid,
})

export const fromFirestore: FirestoreDataConverter<DocumentData>['fromFirestore'] = snapshot => ({
  id: snapshot.id,
  ...snapshot.data(),
})

export const defaultConverter: FirestoreDataConverter<DocumentData> = {
  toFirestore,
  fromFirestore,
}
