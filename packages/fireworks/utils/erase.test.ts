import { expect, it, vi } from 'vitest'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { erase } from './erase'

// --- Create and save data references
vi.mock('firebase/firestore')
const references = Array.from({ length: 600 }).map(() => doc(collection(<any>undefined, 'erased')))
await Promise.all(references.map(async reference => await setDoc(reference, { foo: 'bar' })))

it('should remove a firestore document from the database', async() => {
  const reference = references[0]

  // --- Get state before/after erasing
  const existing = await getDoc(reference)
  const result = await erase('erased', reference)
  const deleted = await getDoc(reference)

  // --- Assert.
  expect(result).toEqual(undefined)
  expect(existing.exists()).toEqual(true)
  expect(deleted.exists()).toEqual(false)
})

it('should remove multiple firestore documents from the database', async() => {
  const references100 = references.slice(1)

  // --- Get state before/after erasing
  const existing = await Promise.all(references100.map(getDoc))
  const result = await erase('erased', references100)
  const deleted = await Promise.all(references100.map(getDoc))

  // --- Assert.
  expect(result).toEqual(undefined)
  expect(existing.every(x => x.exists())).toEqual(true)
  expect(deleted.every(x => !x.exists())).toEqual(true)
})
