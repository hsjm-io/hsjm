// @vitest-environment happy-dom
import { expect, it } from 'vitest'
import { doc, endAt, endBefore, limit, limitToLast, orderBy, query, startAfter, startAt, where } from 'firebase/firestore'
import { collectionReference } from './fixtures'
import { createQuery } from './createQuery'

it('should create a query for a document given a path and an ID', () => {
  const reference = doc(collectionReference)
  const result = createQuery('mock', reference.id)
  expect(result).toEqual(doc(collectionReference, reference.id))
})

it('should create a query for a collection given a path and no options', () => {
  const reference = doc(collectionReference)
  const result = createQuery('mock')
  expect(result.type).toEqual(reference.type)
})

it('should create a query for a document given a path and a query filter', () => {
  const result = createQuery('mock', {
    $orderBy: [
      'foo',
      'bar',
      ['baz', 'desc'],
    ],
    $startAt: 1,
    $startAfter: 0,
    $endAt: 10,
    $endBefore: 11,
    $limit: 5,
    $limitToLast: 10,
  })
  expect(result).toEqual(query(collectionReference,
    orderBy('foo', 'asc'),
    orderBy('bar', 'asc'),
    orderBy('baz', 'desc'),
    startAt(1),
    startAfter(0),
    endAt(10),
    endBefore(11),
    limit(5),
    limitToLast(10),
  ))
})

it.each([
  ['==', '', 'foo'],
  ['<', '_lt', 'foo'],
  ['<=', '_lte', 'foo'],
  ['!=', '_ne', 'foo'],
  ['>', '_gt', 'foo'],
  ['>=', '_gte', 'foo'],
  ['not-in', '_nin', ['foo', 'bar']],
  ['in', '_in', ['foo', 'bar']],
  ['array-contains', '_ac', ['foo', 'bar']],
  ['array-contains-any', '_aca', ['foo', 'bar']],
])('should create a "where" query of type "%s" when using the suffix "%s"', (filterOp, suffix, data) => {
  const result = createQuery('mock', { [`foo${suffix}`]: data })
  expect(result).toEqual(query(collectionReference, where('foo', filterOp as any, data)))
})
