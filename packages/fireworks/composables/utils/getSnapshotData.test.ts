import { expect, it, vi } from 'vitest'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { getSnapshotData } from './getSnapshotData'

// --- Create and save data references
vi.mock('firebase/firestore')
const collectionReference = collection(<any>undefined, 'getSnapshot')
const references = Array.from({ length: 600 }).map(() => doc(collectionReference))
await Promise.all(references.map(async reference => await setDoc(reference, { foo: 'bar' })))

it('should return a snapshot data and its ID', async() => {
  const snapshot = await getDoc(references[0])
  const result = getSnapshotData(snapshot)
  expect(result?.id).toEqual(references[0].id)
  expect(result?.foo).toEqual('bar')
})

it('should return a query snapshot data and their ids', async() => {
  const snapshots = await getDocs(collectionReference)
  const result = getSnapshotData(snapshots)
  expect(result.every(x => typeof x.id === 'string')).toEqual(true)
  expect(result.every(x => x.foo === 'bar')).toEqual(true)
  expect(result.length).toEqual(600)
})

it('should return the query snapshot first entry data and id', async() => {
  const snapshots = await getDocs(collectionReference)
  const result = getSnapshotData(snapshots, true)
  expect(result?.id).toEqual(references[0].id)
  expect(result?.foo).toEqual('bar')
})
