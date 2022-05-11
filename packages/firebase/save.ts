import { DocumentData, collection, doc, setDoc, writeBatch } from 'firebase/firestore'
import { chunk } from '@hsjm/shared'
import { useFirebase } from './useFirebase'

// --- Overloads.
export type Save<T = DocumentData> = (path: string, data: T | T[]) => Promise<void>

/**
 * Update or create document(s) to Firestore.
 * @param path Collection path.
 * @param data Document(s) to save.
 */
export const save: Save = async(path, data) => {
  // --- Get collection reference.
  const { firestore, auth } = useFirebase()
  const colReference = collection(firestore, path)

  // --- Save batches in bulk.
  if (Array.isArray(data)) {
    const chunks = chunk(data, 500)
    const promises = chunks.map((chunk) => {
      const batch = writeBatch(firestore)
      for (const x of chunk) batch.set(doc(colReference, x.id), x)
      return batch.commit()
    })
    await Promise.all(promises)
    return
  }

  // --- Compute document reference.
  const documentReference = data.id
    ? doc(colReference, data.id)
    : doc(colReference)

  // --- Save single.
  return await setDoc(documentReference, {
    ...data,
    origin: 'client',
    updatedById: auth.currentUser?.uid,
  })
}
