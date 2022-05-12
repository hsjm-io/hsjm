/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/prefer-switch */
import { isNil } from '@hsjm/shared'
import {
  DocumentData, DocumentReference, FirestoreDataConverter,
  Query, QueryConstraint, collection, doc,
  endAt, endBefore, limit,
  orderBy, query, startAfter, startAt, where,
} from 'firebase/firestore'
import { useFirebase } from '../useFirebase'
import { defaultConverter } from './defaultConverter'

export interface CreateQueryOptions {
  converter?: FirestoreDataConverter<DocumentData>
}

export interface QueryFilter {
  $limit?: number
  $startAt?: number
  $startAfter?: number
  $endAt?: number
  $endBefore?: number
  $orderBy?: string | string[]
  [x: string]: any
}

export interface CreateQuery {
  <T extends DocumentData>(path: string, filter?: QueryFilter, options?: CreateQueryOptions): Query<T>
  <T extends DocumentData>(path: string, filter?: string | null, options?: CreateQueryOptions): DocumentReference<T>
}

/**
 * Create a `Query` or `DocumentReference` based on the `filter` object.
 * @param path Collection path.
 * @param filter ID string or `QueryFilter`
 */
export const createQuery: CreateQuery = (path, filter, options = {}): any => {
  // --- Initialize variables.
  const { firestore } = useFirebase()
  const { converter = defaultConverter } = options
  const constraints: QueryConstraint[] = []

  // --- Return a single document's reference & Abort early.
  if (typeof filter === 'string') return doc(firestore, path, filter).withConverter(converter)
  if (filter === null || filter === undefined) return doc(firestore, path).withConverter(converter)

  // --- Resolve collection
  const colReference = collection(firestore, path).withConverter(converter)

  // --- Generate constraints from object.
  Object.entries(filter).forEach(([key, value]) => {
    if (key === '$limit') constraints.push(limit(value))
    else if (key === '$startAt') constraints.push(startAt(value))
    else if (key === '$startAfter') constraints.push(startAfter(value))
    else if (key === '$endAt') constraints.push(endAt(value))
    else if (key === '$endBefore') constraints.push(endBefore(value))
    else if (key === '$orderBy') constraints.push(orderBy(value))
    else if (key.endsWith('_lt')) constraints.push(where(key.replace('_lt', ''), '<', value))
    else if (key.endsWith('_lte')) constraints.push(where(key.replace('_lte', ''), '<=', value))
    else if (key.endsWith('_ne')) constraints.push(where(key.replace('_ne', ''), '!=', value))
    else if (key.endsWith('_gt')) constraints.push(where(key.replace('_gt', ''), '>', value))
    else if (key.endsWith('_gte')) constraints.push(where(key.replace('_gte', ''), '>=', value))
    else if (key.endsWith('_in')) constraints.push(where(key.replace('_in', ''), 'in', value))
    else if (key.endsWith('_nin')) constraints.push(where(key.replace('_nin', ''), 'not-in', value))
    else if (key.endsWith('_ac')) constraints.push(where(key.replace('_ac', ''), 'array-contains', value))
    else if (key.endsWith('_aca')) constraints.push(where(key.replace('_aca', ''), 'array-contains-any', value))
    else if (key.trim().length > 0 && !isNil(value)) constraints.push(where(key, '==', value))
  })

  // --- Return query.
  return constraints.length > 0
    ? query(colReference, ...constraints)
    : query(colReference, limit(100))
}
