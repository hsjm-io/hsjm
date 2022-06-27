import { omit } from '@hsjm/shared'
import { DocumentData, FirestoreDataConverter } from 'firebase/firestore'
import { useFirebase } from '../useFirebase'

export const toFirestore: FirestoreDataConverter<DocumentData>['toFirestore'] = data => ({
  ...omit(data, ['__errors', '__origin', 'id']),
  updatedById: useFirebase().auth.currentUser?.uid,
})

export const fromFirestore: FirestoreDataConverter<DocumentData>['fromFirestore'] = snapshot => ({
  id: snapshot.id,
  ...omit(snapshot.data(), ['__origin', 'id']),
})

export const defaultConverter: FirestoreDataConverter<DocumentData> = {
  toFirestore,
  fromFirestore,
}
