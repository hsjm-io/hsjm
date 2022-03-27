import { DocumentData, collection, doc, getFirestore, setDoc, writeBatch } from 'firebase/firestore'
import { chunk } from 'lodash'

/**
 * Update or create document(s) to Firestore.
 * @param path Collection path.
 * @param data Document(s) to save.
 */
export const save = async(path: string, data: DocumentData | DocumentData[]) => {
  // --- Get collection reference.
  const colReference = collection(getFirestore(), path)

  // --- Save in bulk.
  if (Array.isArray(data)) {
    // --- Chunk batches.
    const chunks = chunk(data, 500)

    // --- Save in batches.
    const promises = chunks.map((chunk) => {
      const batch = writeBatch(getFirestore())
      for (const x of chunk) batch.set(doc(colReference, x.id), x)
      return batch.commit()
    })

    // --- Wait for all batches to finish.
    await Promise.all(promises)
    return
  }

  // --- Save single.
  return await setDoc(doc(colReference, data.id), data)
}
