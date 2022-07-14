/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/consistent-destructuring */
import { DocumentData, Firestore, collection, deleteDoc, doc, getFirestore, writeBatch } from 'firebase/firestore'
import { MaybeArray, arrayify, chunk, delay } from '@hsjm/shared'
import { FirebaseApp } from 'firebase/app'

export interface EraseOptions {
  /** The Firebase app to use. */
  app?: FirebaseApp
  /** The Firestore instance to use. */
  firestore?: Firestore
  /** The batch size to use when erasing. */
  batchSize?: number
  /** The delay to use between each batches. */
  batchDelay?: number
}

/**
 * Erase document(s) from Firestore.
 * @param {string} path The path of the collection
 * @param {string | T | Array<string | T>} [data] The ID(s) of the document(s) to delete, or the object(s) with `id` property.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export const erase = async<T = DocumentData>(path?: string, data?: MaybeArray<string | T>, options: EraseOptions = {}): Promise<void> => {
  // --- Destructure and default options.
  const { batchSize = 500, batchDelay = 0, firestore = getFirestore(options.app) } = options

  // --- Handle edge cases.
  if (!data || (Array.isArray(data) && data.length === 0)) return
  if (!firestore) return console.warn('[erase] Firestore is not defined.')
  if (!path) return console.warn('[erase] Path is not defined.')

  // --- Map input to document references.
  const collectionReference = collection(firestore, path)
  const documentReferences = arrayify(data)
    .map((x: any) => x.id ?? x)
    .filter(Boolean)
    .map(id => doc(collectionReference, id))

  // --- Delete single document or abort if empty.
  if (documentReferences.length === 0) return
  if (documentReferences.length === 1) return await deleteDoc(documentReferences[0])

  // --- Delete chunks in bulk.
  const chunks = chunk(documentReferences, batchSize)
  await Promise.all(chunks.map(async(chunk) => {
    const batch = writeBatch(firestore)
    for (const ref of chunk) batch.delete(ref)
    if (batchDelay > 0) await delay(batchDelay)
    await batch.commit()
  }))
}
