/* eslint-disable unicorn/no-null */
import { expect, it } from 'vitest'
import { mockData, mockFirestoreGet } from './fixtures'
import { save } from './save'

it.concurrent('should add a new document in Firestore and return its ID', async() => {
  const data = { ...mockData(), isUndefined: undefined, isNull: null }
  const result = await save('users', data)
  const [remote] = mockFirestoreGet(result)
  expect(result).toBeTypeOf('string')
  expect(remote?.age).toEqual(data.age)
  expect(remote).not.toHaveProperty('isNull')
  expect(remote).not.toHaveProperty('isUndefined')
})

it.concurrent('should update a document in Firestore and return its ID', async() => {
  const data = mockData()
  const result = await save('users', data)
  const updatedData = { id: result, ...data, name: 'Jane Doe' }
  const updatedResult = await save('users', updatedData)
  const [updatedRemote] = mockFirestoreGet(updatedResult)
  expect(updatedResult).toEqual(result)
  expect(updatedRemote?.name).toEqual(updatedData.name)
})

it.concurrent('should add multiple documents to Firestore', async() => {
  const data = [mockData(), mockData()]
  const result = await save('users', data)
  const remote = mockFirestoreGet(result)
  expect(result?.length).toEqual(data.length)
  expect(remote[0]?.age).toEqual(data[0].age)
  expect(remote[1]?.age).toEqual(data[1].age)
})

it.concurrent('should save more than 500 documents in Firestore', async() => {
  const uniqueId = Math.random().toString()
  const data = Array.from({ length: 600 }).fill(0).map(() => ({ ...mockData(), uniqueId }))
  const result = await save('users', data)
  const remote = mockFirestoreGet(result)
  expect(result?.length).toEqual(data.length)
  expect(remote.every(x => x?.uniqueId === uniqueId)).toEqual(true)
})

it.concurrent('should return undefined/[] if no data is provided', async() => {
  const result = await save('users')
  const resultNull = await save('users', null)
  const resultEmpty = await save('users', [])
  expect(result).toBeUndefined()
  expect(resultNull).toBeUndefined()
  expect(resultEmpty).toEqual([])
})
