/* eslint-disable unicorn/prevent-abbreviations */
import { initializeApp } from 'firebase/app'
import { beforeEach, vi } from 'vitest'
import { DocumentReference, Query, QueryDocumentSnapshot, QuerySnapshot, collection, connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { delay, noop, randomString } from '@hsjm/shared'

// --- Initialize Firesbase
export const app = initializeApp({
  projectId: 'test',
  apiKey: 'test',
  authDomain: 'test',
  databaseURL: 'test',
  storageBucket: 'test',
})
export const firestore = initializeFirestore(app, {})
export const collectionReference = collection(firestore, 'mock')
connectFirestoreEmulator(firestore, 'localhost', 15004)
connectFunctionsEmulator(getFunctions(app), 'localhost', 15004)
const firestoreDatabase: Record<string, any> = {}

// --- Mock Firestore
beforeEach(() => {
  // --- Mock Firestore
  vi.mock('firebase/firestore', () => ({

    // --- Defaults
    ...require('firebase/firestore'),

    // --- Mock setDoc
    setDoc: async(reference: DocumentReference, data: any) => {
      await delay(5)
      const id = reference.id ?? randomString(16)
      // @ts-expect-error: ignore
      firestoreDatabase[reference.id = id] = data
    },

    // --- Mock getDoc
    getDoc: async(reference: DocumentReference): Promise<QueryDocumentSnapshot> => ({
      id: reference.id,
      exists: () => reference.id in firestoreDatabase,
      data: () => firestoreDatabase[reference.id],
      metadata: {} as any,
      get: (key: string) => firestoreDatabase[reference.id][key],
      ref: reference,
    }),

    getDocs: async(query: Query): Promise<QuerySnapshot> => {
      await delay(5)

      // @ts-expect-error: ignores
      const _query = query._query
      const _limit = _query.limit ?? Number.POSITIVE_INFINITY
      const _filters = Object.fromEntries(_query.filters.map((filter: any) => [
        filter.field.segments.join('.'),
        Object.values(filter.value).pop(),
      ]))

      // --- Filter by query
      const docs = Object.entries(firestoreDatabase)
        .filter(([, data]) => {
          for (const [key, value] of Object.entries(_filters)) {
            if (data[key] !== value)
              return false
          }
          return true
        })
        .map(([id, data]) => ({
          id,
          exists: () => true,
          data: () => data,
          metadata: {} as any,
          get: (key: string) => data[key],
          ref: {} as any,
        }))
        .slice(0, _limit)

      // --- Return QuerySnapshot
      return {
        metadata: {} as any,
        size: docs.length,
        docChanges: noop as any,
        forEach: noop as any,
        empty: docs.length > 0,
        query: query as any,
        docs,
      }
    },

    deleteDoc: async(reference: DocumentReference) => {
      await delay(5)
      delete firestoreDatabase[reference.id]
    },

    // --- Mock writebatch
    writeBatch: (_firestore: any) => {
      const batchSet: [DocumentReference, any][] = []
      const batchDelete: DocumentReference[] = []
      return {

        // --- Write to batch
        set: (reference: DocumentReference, data: any) => {
          batchSet.push([reference, data])
        },

        // --- Add a delete to batch
        delete: (reference: DocumentReference) => {
          batchDelete.push(reference)
        },

        commit: async() => {
          await delay(5)
          if (batchSet.length > 500) throw new Error('Too many writes')
          for (const [reference, data] of batchSet) firestoreDatabase[reference.id] = data
          if (batchDelete.length > 500) throw new Error('Too many deletes')
          for (const reference of batchDelete) delete firestoreDatabase[reference.id]
        },
      }
    },

  }))
})

// --- Mock a new documents
export const mockData = () => ({
  name: 'John Doe',
  age: Math.random() * 100,
})

// --- Get a mocked document from the database
export const mockFirestoreGet = (ids: string | string[]) => {
  if (!Array.isArray(ids)) ids = [ids]
  return ids.map(id => firestoreDatabase[id])
}

// --- Push mocked documents to the database
export const mockFirestoreSet = (data: any): string[] => {
  if (!Array.isArray(data)) data = [data]
  const ids: string[] = []
  for (const item of data) {
    const id = item.id ?? randomString(16)
    firestoreDatabase[id] = item
    ids.push(id)
  }
  return ids
}
