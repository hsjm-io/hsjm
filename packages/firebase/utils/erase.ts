/* eslint-disable array-callback-return */
import { DocumentData, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import { MaybeArray, arrayify, chunk } from '@hsjm/shared'
import { useFirebase } from '../useFirebase'

/**
 * Erase document(s) from Firestore.
 * @param {string} path The path of the collection
 * @param {string | T | Array<string | T>} [data] The ID of the document to delete, or an object with an ID
 * @returns {Promise<void>}
 */
export const erase = async<T = DocumentData>(path: string, data?: MaybeArray<string | T>): Promise<void> => {
  // --- Get collection reference.
  const { firestore } = useFirebase()

  // --- Handle errors.
  if (!path) throw new Error('No path was provided.')
  if (!data) throw new Error('No data was provided.')

  // --- Map input to document references.
  const documentReferences = arrayify(data)
    .map((x) => {
      if (typeof x === 'string') return x
      if ('id' in x) return (<any>x).id
    })
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
