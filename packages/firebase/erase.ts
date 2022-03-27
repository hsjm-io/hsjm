import { DocumentData, collection, deleteDoc, doc, getFirestore, writeBatch } from 'firebase/firestore'
import { chunk } from 'lodash'

/**
 * Erase document(s) from Firestore.
 * @param path Collection path.
 * @param data Document(s) to erase.
 */
export const erase = async(path: string, data: string | DocumentData | (string | DocumentData)[]) => {
  // --- Get collection reference.
  const colReference = collection(getFirestore(), path)

  // --- Erase in bulk.
  if (Array.isArray(data)) {
    // --- Chunk batches.
    const chunks = chunk(data, 500)

    // --- Save in batches.
    const promises = chunks.map((chunk) => {
      const batch = writeBatch(getFirestore())
      chunk.forEach(x => batch.delete(doc(colReference, typeof x === 'string' ? x : x.id)))
      return batch.commit()
    })

    // --- Wait for all batches to finish.
    await Promise.all(promises)
    return
  }

  // --- Erase single.
  return deleteDoc(doc(colReference, typeof data === 'string' ? data : data.id))
}
