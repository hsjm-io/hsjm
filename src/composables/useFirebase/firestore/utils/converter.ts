import type firebase from 'firebase'
import { UseFirestoreDocument } from '../types'

/** Converter used to keep `id` and `ref` in an innumerable property of the document's data object. */
export const converter: firebase.firestore.FirestoreDataConverter<UseFirestoreDocument> = {

    /** Remove id and ref */
    toFirestore: (modelObject: Partial<UseFirestoreDocument>): firebase.firestore.DocumentData => {
        delete modelObject.id
        delete modelObject.ref
        return modelObject
    },

    /** Inject id and ref. */
    fromFirestore: (
        snapshot: firebase.firestore.QueryDocumentSnapshot<UseFirestoreDocument>,
        options: firebase.firestore.SnapshotOptions
    ): UseFirestoreDocument => {

        //--- Get data.
        const data = snapshot.data(options)

        //--- Inject id and ref.
        Object.defineProperty(data, 'id', { value: snapshot.id, writable: false, enumerable: false })
        Object.defineProperty(data, 'ref', { value: snapshot.ref, writable: false, enumerable: false })

        //--- Return data
        return data
    }
}