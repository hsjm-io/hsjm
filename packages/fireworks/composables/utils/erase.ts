/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable array-callback-return */
import { DocumentData, Firestore, deleteDoc, doc, getFirestore, writeBatch } from 'firebase/firestore'
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
 * @param {string | T | Array<string | T>} [data] The ID of the document to delete, or an object with an ID
 * @returns {Promise<void>}
 */
export const erase = async<T = DocumentData>(path: string, data: MaybeArray<string | T>, options: EraseOptions = {}): Promise<void> => {
  // --- Destructure and default options.
  const { batchSize = 500, batchDelay = 0, firestore = getFirestore(options.app) } = options

  // --- Map input to document references.
  const documentReferences = arrayify(data)
    .map((x: any) => x.id ?? x)
    .filter(Boolean)
    .map(id => doc(firestore, path, id))

  // --- Delete single document or abort if empty.
  if (documentReferences.length === 0) return
  if (documentReferences.length === 1) return await deleteDoc(documentReferences[0])

  // --- Delete chunks in bulk.
  const chunks = chunk(documentReferences, batchSize)
  await Promise.all(chunks.map(async(chunk) => {
    const batch = writeBatch(firestore)
    for (const reference of chunk) batch.delete(reference)
    if (batchDelay) await delay(batchDelay)
    await batch.commit()
  }))
}
