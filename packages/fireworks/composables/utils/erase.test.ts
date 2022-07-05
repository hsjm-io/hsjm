import { expect, it } from 'vitest'
import { firestore, mockData, mockFirestoreGet, mockFirestoreSet } from './fixtures'
import { erase } from './erase'

it('should remove a firestore document from the database', async() => {
  const data = mockData()
  const [id] = mockFirestoreSet(data)
  const result = await erase('users', id, { firestore })
  const deleted = mockFirestoreGet(id)
  expect(deleted).toEqual([undefined])
  expect(result).toEqual(undefined)
})

it('should remove multiple firestore documents from the database', async() => {
  const data = [mockData(), mockData()]
  const ids = mockFirestoreSet(data)
  const result = await erase('users', ids, { firestore })
  const deleted = mockFirestoreGet(ids)
  expect(deleted).toEqual([undefined, undefined])
  expect(result).toEqual(undefined)
})

it('should remove more than 500 firestore documents from the database', async() => {
  const uniqueId = Math.random().toString()
  const data = Array.from({ length: 600 }).fill(0).map(() => ({ ...mockData(), uniqueId }))
  const ids = mockFirestoreSet(data)
  const result = await erase('users', ids)
  const deleted = mockFirestoreGet(ids)
  expect(deleted).toEqual(Array.from({ length: 600 }))
  expect(result).toEqual(undefined)
})
