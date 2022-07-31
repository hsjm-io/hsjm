/* eslint-disable unicorn/consistent-destructuring */
import { DocumentData, FieldPath, collection, doc, getFirestore, writeBatch } from 'firebase/firestore'
import { arrayify, chunk, isNotNil, pick } from '@hsjm/shared'
import { getAuth } from 'firebase/auth'
import { FirebaseApp } from 'firebase/app'

export interface FirestoreSaveOptions {
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

/**
 * Update or create document(s) to Firestore and return the document(s) id(s).
 * @param {string} path Collection path.
 * @param {any} data Document(s) to firestoreSave.
 * @returns {Promise<string | string[]>} Document(s) id(s).
 */
export async function firestoreSave<T = DocumentData>(path: string, data?: T, options?: FirestoreSaveOptions): Promise<string | undefined>
export async function firestoreSave<T = DocumentData>(path: string, data?: T[], options?: FirestoreSaveOptions): Promise<string[]>
export async function firestoreSave<T = DocumentData>(path: string, data?: T | T[], options?: FirestoreSaveOptions): Promise<string | undefined | string[]>
export async function firestoreSave<T = DocumentData>(this: FirebaseApp | undefined, path: string, data?: T | T[], options: FirestoreSaveOptions = {}): Promise<string | undefined | string[]> {
  // --- Destructure and default options.
  const { batchSize = 500, parallel, merge, mergeFields } = options

  // --- Handle edge cases.
  if (Array.isArray(data) && data.length === 0) return
  if (!path) throw new Error('[firestoreErase] Path is not defined.')
  if (!data) throw new Error('[firestoreErase] Data is not defined.')
  if (batchSize > 500) throw new Error('[firestoreErase] Batch size is too big, it should be less than 500.')

  // --- Map input to document references.
  const auth = getAuth(this)
  const firestore = getFirestore(this)
  const updatedById = auth.currentUser?.uid
  const collectionReference = collection(firestore, path)
  const documentReferences = arrayify(data)
    .filter(Boolean)
    .map((x: any) => ({
      ref: x.id ? doc(collectionReference, x.id) : doc(collectionReference),
      data: pick({ id: undefined, ...x, updatedById }, isNotNil),
    }))

  // --- FirestoreSave chunks in bulk.
  const chunks = chunk(documentReferences, batchSize)
  await Promise.all(chunks.map(async(chunk) => {
    const batch = writeBatch(firestore)
    for (const { data, ref } of chunk) batch.set(ref, data, { merge, mergeFields })
    const batchPromise = batch.commit()
    if (!parallel) await batchPromise
  }))

  // --- Return document ids.
  return Array.isArray(data)
    ? documentReferences.map(x => x.ref.id)
    : documentReferences[0].ref.id
}
