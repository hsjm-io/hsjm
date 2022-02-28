
import type firebase from 'firebase/app'
import { UseFirestoreDocument, UseFirestoreOptions } from '../types'

/**
 * 
 */
 export const convertFromFirestore = (
    snapshot: firebase.firestore.DocumentSnapshot,
    options?: UseFirestoreOptions,
 ): UseFirestoreDocument => {

   //--- Abort if doesn't exists.
   if(!snapshot.exists) throw new Error("The document of the `snapshot` does not exists.")

   //--- Get data.
   const data = snapshot.data(options) as firebase.firestore.DocumentData

   //--- Inject id and ref.
   Object.defineProperty(data, 'id', { value: snapshot.id, configurable: true })
   Object.defineProperty(data, 'ref', { value: snapshot.ref, configurable: true })

   //--- Inject `storage`.


   //--- Return data
   return data
}