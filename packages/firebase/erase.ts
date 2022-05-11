import { DocumentData, collection, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import { chunk } from '@hsjm/shared'
import { useFirebase } from './useFirebase'

// --- Overloads.
export type Erase<T = DocumentData> = (path: string, data: string | T | Array<string | T>) => Promise<void>

/**
 * Erase document(s) from Firestore.
 * @param path Collection path.
 * @param data Document(s) to erase.
 */
export const erase: Erase = async(path, data) => {
  // --- Get collection reference.
  const { firestore } = useFirebase()
  const colReference = collection(firestore, path)

  // --- Erase chunks in bulk.
  if (Array.isArray(data)) {
    const chunks = chunk(data, 500)
    const promises = chunks.map((chunk) => {
      const batch = writeBatch(firestore)
      chunk.forEach(x => batch.delete(doc(colReference, typeof x === 'string' ? x : x.id)))
      return batch.commit()
    })
    await Promise.all(promises)
    return
  }

  // --- Erase single.
  return deleteDoc(doc(colReference, typeof data === 'string' ? data : data.id))
}
