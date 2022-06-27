import { DocumentData, collection, doc, setDoc, writeBatch } from 'firebase/firestore'
import { arrayify, chunk } from '@hsjm/shared'
import { useFirebase } from '../useFirebase'
import { toFirestore } from './defaultConverter'

/**
 * Update or create document(s) to Firestore.
 * @param path Collection path.
 * @param data Document(s) to save.
 */
export const save = async<T = DocumentData>(path: string, data?: T | T[]): Promise<void> => {
  // --- Get collection reference.
  const { firestore } = useFirebase()

  // --- Map input to document references.
  const collectionReference = collection(firestore, path)
  const documentReferences = arrayify(data)
    .filter(Boolean)
    .map((x: any) => ({
      ref: x.id ? doc(collectionReference, x.id) : doc(collectionReference),
      data: toFirestore(x),
    }))

  // --- Delete single document or abort if empty.
  if (documentReferences.length === 1) await setDoc(documentReferences[0].ref, documentReferences[0].data)
  if (documentReferences.length === 0) return

  // --- Delete chunks in bulk.
  const chunks = chunk(documentReferences, 500)
  await Promise.all(chunks.map((chunk) => {
    const batch = writeBatch(firestore)
    chunk.forEach(({ ref, data }) => batch.set(ref, data))
    return batch.commit()
  }))
}
