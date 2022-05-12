import { DocumentData, doc, setDoc, writeBatch } from 'firebase/firestore'
import { arrayify, chunk } from '@hsjm/shared'
import { useFirebase } from '../useFirebase'
import { toFirestore } from './defaultConverter'

// --- Overloads.
export type Save<T = DocumentData> = (path: string, data?: T | T[]) => Promise<void>

/**
 * Update or create document(s) to Firestore.
 * @param path Collection path.
 * @param data Document(s) to save.
 */
export const save: Save = async(path, data) => {
  // --- Get collection reference.
  const { firestore } = useFirebase()

  // --- Map input to document references.
  const documentReferences = arrayify(data)
    .filter(Boolean)
    .map(x => ({
      ref: doc(firestore, path, x.id),
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
