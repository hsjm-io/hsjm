/* eslint-disable unicorn/consistent-destructuring */
import { DocumentData, FieldPath, Firestore, collection, doc, getFirestore, writeBatch } from 'firebase/firestore'
import { arrayify, chunk, delay, isNotNil, pick } from '@hsjm/shared'
import { getAuth } from 'firebase/auth'
import { FirebaseApp } from 'firebase/app'

export interface SaveOptions {
  /** The Firebase app to use. */
  app?: FirebaseApp
  /** The Firestore instance to use. */
  firestore?: Firestore
  /** The batch size to use when making bulk operation. */
  batchSize?: number
  /** The delay to use between each batches. */
  batchDelay?: number
  /**
   * Changes the behavior of a `setDoc()` call to only replace the
   * values specified in its data argument. Fields omitted from the `setDoc()`
   * call remain untouched. If your input sets any field to an empty map, all
   * nested fields are overwritten.
   */
  merge?: boolean
  /**
   * Changes the behavior of `setDoc()` calls to only replace
   * the specified field paths. Any field path that is not specified is ignored
   * and remains untouched. If your input sets any field to an empty map, all
   * nested fields are overwritten.
   */
  mergeFields?: Array<string | FieldPath>
}

// --- Overloads.
export interface Save {
  <T = DocumentData>(path: string, data: T, options?: SaveOptions): Promise<string>
  <T = DocumentData>(path: string, data?: T, options?: SaveOptions): Promise<string | undefined>
  <T = DocumentData>(path: string, data: T[], options?: SaveOptions): Promise<string[]>
  <T = DocumentData>(path: string, data?: T | T[], options?: SaveOptions): Promise<string | string[]>
  <T = DocumentData>(path?: string, data?: T | T[], options?: SaveOptions): Promise<string | string[] | undefined>
}

/**
 * Update or create document(s) to Firestore and return the document(s) id(s).
 * @param {string} path Collection path.
 * @param {any} data Document(s) to save.
 * @returns Document(s) id(s).
 */
export const save: Save = async(path?: string, data?: any | any[], options: SaveOptions = {}): Promise<any> => {
  // --- Destructure and default options.
  const { batchSize = 500, batchDelay = 0, firestore = getFirestore(options.app) } = options

  // --- Handle edge cases.
  if (!data || data.length === 0) return Array.isArray(data) ? [] : undefined
  if (!firestore) return console.warn('[save] Firestore is not defined.')
  if (!path) return console.warn('[save] Path is not defined.')

  // --- Map input to document references.
  const collectionReference = collection(firestore, path)
  const documentReferences = arrayify(data)
    .filter(Boolean)
    .map((x: any) => ({
      ref: x.id ? doc(collectionReference, x.id) : doc(collectionReference),
      data: pick({ id: undefined, ...x, updatedById: getAuth().currentUser?.uid }, isNotNil),
    }))

  // --- Save chunks in bulk.
  const chunks = chunk(documentReferences, batchSize)
  await Promise.all(chunks.map(async(chunk) => {
    const batch = writeBatch(firestore)
    for (const { ref } of chunk) batch.set(ref, data, options)
    if (batchDelay > 0) await delay(batchDelay)
    await batch.commit()
  }))

  // --- Return document ids.
  return Array.isArray(data)
    ? documentReferences.map(x => x.ref.id)
    : documentReferences[0].ref.id
}
