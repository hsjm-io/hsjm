/* eslint-disable unicorn/no-null */
import { expect, it, vi } from 'vitest'
import { collection, doc, getDoc } from 'firebase/firestore'
import { save } from './save'

// --- Create and save data references
vi.mock('firebase/auth')
vi.mock('firebase/firestore')
const mockData = () => ({ foo: 'bar', random: Math.random(), _undefined: undefined, _null: null })

it('should add a new document in Firestore and return its ID', async() => {
  const data = mockData()
  const result = await save('saved', data)
  const remote = await getDoc(doc(collection(<any>undefined, 'saved'), result))
  const remoteData = remote.data()
  expect(result).toEqual(remote.id)
  expect(remoteData?.foo).toEqual(data.foo)
  expect(remoteData?.random).toEqual(data.random)
  expect(remoteData).not.toHaveProperty('_null')
  expect(remoteData).not.toHaveProperty('_undefined')
})

it('should update a document in Firestore and return its ID', async() => {
  const data = mockData()
  const result = await save('saved', data)
  const updatedData = { id: result, ...data, name: 'Jane Doe' }
  const updatedResult = await save('saved', updatedData)
  const updatedRemote = await getDoc(doc(collection(<any>undefined, 'saved'), updatedResult))
  const updatedRemotData = updatedRemote.data()
  expect(updatedResult).toEqual(result)
  expect(updatedRemotData?.name).toEqual(updatedData.name)
})

it.concurrent('should add multiple documents to Firestore', async() => {
  const data = Array.from({ length: 600 }).map(mockData)
  const results = await save('saved600', data)
  const remotes = await Promise.all(results.map(result => getDoc(doc(collection(<any>undefined, 'saved600'), result))))
  expect(remotes?.length).toEqual(data.length)
  expect(remotes?.every(x => typeof x.id === 'string')).toEqual(true)
})

it.concurrent('should return undefined/[] if no data is provided', async() => {
  const result = await save('saved')
  const resultNull = await save('saved', null)
  const resultEmpty = await save('saved', [])
  expect(result).toBeUndefined()
  expect(resultNull).toBeUndefined()
  expect(resultEmpty).toEqual([])
})
