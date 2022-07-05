/* eslint-disable unicorn/consistent-destructuring */
import { DocumentData, Firestore, SetOptions, collection, doc, getFirestore, writeBatch } from 'firebase/firestore'
import { MaybeArray, arrayify, chunk, isNotNil, pick } from '@hsjm/shared'
import { getAuth } from 'firebase/auth'
import { FirebaseApp } from 'firebase/app'

export type SaveOptions = SetOptions & {
  /** The Firebase app to use. */
  app?: FirebaseApp
  /** The Firestore instance to use. */
  firestore?: Firestore
}

// --- Overloads.
export interface Save {
  <T = DocumentData>(path: string, data?: Array<T>, options?: SaveOptions): Promise<Array<string>>
  <T = DocumentData>(path: string, data?: T, options?: SaveOptions): Promise<string>
  <T = DocumentData>(path: string, data?: MaybeArray<T>, options?: SaveOptions): Promise<MaybeArray<string>>
}

/**
 * Update or create document(s) to Firestore and return the document(s) id(s).
 * @param {string} path Collection path.
 * @param {any} data Document(s) to save.
 * @returns Document(s) id(s).
 */
export const save: Save = async(path: string, data: MaybeArray<any>, options: SaveOptions = {}): Promise<any> => {
  // --- Handle edge cases.
  if (!data || data.length === 0) return Array.isArray(data) ? [] : undefined

  // --- Destructure and default options.
  const { firestore = getFirestore(options.app) } = options

  // --- Map input to document references.
  const collectionReference = collection(firestore, path)
  const documentReferences = arrayify(data)
    .filter(Boolean)
    .map((x: any) => ({
      ref: x.id ? doc(collectionReference, x.id) : doc(collectionReference),
      data: pick({ id: undefined, ...x, updatedById: getAuth().currentUser?.uid }, isNotNil),
    }))

  // --- Save chunks in bulk.
  const chunks = chunk(documentReferences, 500)
  await Promise.all(chunks.map((chunk) => {
    const batch = writeBatch(firestore)
    chunk.forEach(({ ref, data }) => batch.set(ref, data, options))
    return batch.commit()
  }))

  // --- Return document ids.
  return Array.isArray(data)
    ? documentReferences.map(x => x.ref.id)
    : documentReferences[0].ref.id
}
