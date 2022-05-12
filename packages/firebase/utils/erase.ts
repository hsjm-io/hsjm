import { DocumentData, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import { arrayify, chunk } from '@hsjm/shared'
import { useFirebase } from '../useFirebase'

// --- Overloads.
export type Erase<T = DocumentData> = (path: string, data?: string | T | Array<string | T>) => Promise<void>

/**
 * Erase document(s) from Firestore.
 * @param path Collection path.
 * @param data Document(s) to erase.
 */
export const erase: Erase = async(path, data) => {
  // --- Get collection reference.
  const { firestore } = useFirebase()

  // --- Map input to document references.
  const documentReferences = arrayify(data)
    .map(x => (typeof x === 'string' ? x : x.id))
    .filter(Boolean)
    .map(id => doc(firestore, path, id))

  // --- Delete single document or abort if empty.
  if (documentReferences.length === 1) await deleteDoc(documentReferences[0])
  if (documentReferences.length === 0) return

  // --- Delete chunks in bulk.
  const chunks = chunk(documentReferences, 500)
  await Promise.all(chunks.map((chunk) => {
    const batch = writeBatch(firestore)
    chunk.forEach(batch.delete)
    return batch.commit()
  }))
}
