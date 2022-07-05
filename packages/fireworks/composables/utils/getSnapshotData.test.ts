import { doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { expect, it } from 'vitest'
import { collectionReference, mockData } from './fixtures'
import { getSnapshotData } from './getSnapshotData'

it('should return a snapshot data and its ID', async() => {
  const reference = doc(collectionReference)
  await setDoc(reference, mockData())
  const snapshot = await getDoc(reference)
  const result = getSnapshotData(snapshot)
  expect(result?.id).toEqual(reference.id)
})

it('should return a query snapshot data and their IDS', async() => {
  const reference1 = doc(collectionReference)
  const reference2 = doc(collectionReference)
  const reference3 = doc(collectionReference)
  const data = mockData()
  setDoc(reference1, data)
  setDoc(reference2, data)
  setDoc(reference3, data)
  const dataQuery = query(collectionReference, where('age', '==', data.age))
  const snapshots = await getDocs(dataQuery)
  const result = getSnapshotData(snapshots)
  expect(result[0]?.age).toEqual(data.age)
  expect(result[1]?.age).toEqual(data.age)
  expect(result[2]?.age).toEqual(data.age)
})

it('should return the query snapshot first entry data and its ID', async() => {
  const reference = doc(collectionReference)
  const data = mockData()
  setDoc(reference, data)
  const dataQuery = query(collectionReference, where('age', '==', data.age))
  const snapshots = await getDocs(dataQuery)
  const result = getSnapshotData(snapshots, true)
  expect(result?.id).toEqual(reference.id)
  expect(result?.age).toEqual(data.age)
})
