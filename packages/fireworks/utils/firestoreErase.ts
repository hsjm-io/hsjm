/* eslint-disable unicorn/consistent-destructuring */
import { DocumentData, collection, deleteDoc, doc, getFirestore, writeBatch } from 'firebase/firestore'
import { MaybeArray, arrayify, chunk } from '@hsjm/shared'
import { FirebaseApp } from 'firebase/app'

export interface FirestoreEraseOptions {
  /**
   * The number of document to process at the same time.
   * @default 500
   */
  batchSize?: number
  /**
   * If `true`, all the batches will be commited immediately.
   * @default false
   */
  parallel?: boolean
}

/**
 * FirestoreErase document(s) from Firestore.
 * @this {FirebaseApp} The Firebase app to use.
 * @param {string} path The path of the collection
 * @param {string | T | Array<string | T>} [data] The ID(s) of the document(s) to delete, or the object(s) with `id` property.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export async function firestoreErase<T = DocumentData>(path: string, data: MaybeArray<string | T>, options?: FirestoreEraseOptions): Promise<void>
export async function firestoreErase<T = DocumentData>(this: FirebaseApp | undefined, path: string, data: MaybeArray<string | T>, options: FirestoreEraseOptions = {}): Promise<void> {
  // --- Destructure and default options.
  const { batchSize = 500, parallel } = options

  // --- Handle edge cases.
  if (Array.isArray(data) && data.length === 0) return
  if (!path) throw new Error('[firestoreErase] Path is not defined.')
  if (!data) throw new Error('[firestoreErase] Data is not defined.')
  if (batchSize > 500) throw new Error('[firestoreErase] Batch size is too big, it should be less than 500.')

  // --- Map input to document references.
  const firestore = getFirestore(this)
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
    for (const reference of chunk) batch.delete(reference)
    const batchPromise = batch.commit()
    if (!parallel) await batchPromise
  }))
}
