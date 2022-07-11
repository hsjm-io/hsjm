// @vitest-environment happy-dom
import { expect, it, vi } from 'vitest'
import { collection, doc } from 'firebase/firestore'
import { createQuery } from './createQuery'

vi.mock('firebase/firestore')
const collectionReference = collection(<any>undefined, 'createQuery')

it('should create a query for a document given a path and an ID', () => {
  const reference = doc(collectionReference)
  const result = createQuery('createQuery', reference.id)
  expect(result.id).toEqual(reference.id)
  expect(result.type).toEqual('document')
})

it('should create a query for a collection given a path and no options', () => {
  const reference = doc(collectionReference)
  const result = createQuery('createQuery')
  expect(result.type).toEqual(reference.type)
})

// TODO: Mock `firebase/firestore` filtering and sorting methods.
// endAt, endBefore, limit, limitToLast, orderBy, query, startAfter, startAt, where

// it('should create a query for a document given a path and a query filter', () => {
//   const result = createQuery('createQuery', {
//     $orderBy: ['foo', 'bar', ['baz', 'desc']],
//     $startAt: 1,
//     $startAfter: 0,
//     $endAt: 10,
//     $endBefore: 11,
//     $limit: 5,
//     $limitToLast: 10,
//   })
//   expect(result).toEqual(query(collectionReference,
//     orderBy('foo', 'asc'),
//     orderBy('bar', 'asc'),
//     orderBy('baz', 'desc'),
//     startAt(1),
//     startAfter(0),
//     endAt(10),
//     endBefore(11),
//     limit(5),
//     limitToLast(10),
//   ))
// })

// it.each([
//   ['==', '', 'foo'],
//   ['<', '_lt', 'foo'],
//   ['<=', '_lte', 'foo'],
//   ['!=', '_ne', 'foo'],
//   ['>', '_gt', 'foo'],
//   ['>=', '_gte', 'foo'],
//   ['not-in', '_nin', ['foo', 'bar']],
//   ['in', '_in', ['foo', 'bar']],
//   ['array-contains', '_ac', ['foo', 'bar']],
//   ['array-contains-any', '_aca', ['foo', 'bar']],
// ])('should create a "where" query of type "%s" when using the suffix "%s"', (filterOp, suffix, data) => {
//   const result = createQuery('createQuery', { [`foo${suffix}`]: data })
//   expect(result).toEqual(query(collectionReference, where('foo', filterOp as any, data)))
// })
