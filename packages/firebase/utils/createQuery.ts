/* eslint-disable unicorn/prefer-switch */
import { isNil } from '@hsjm/shared'
import {
  CollectionReference, DocumentData, DocumentReference,
  FirestoreDataConverter, Query, QueryConstraint, collection,
  doc, endAt, endBefore,
  limit, orderBy, query, startAfter, startAt, where,
} from 'firebase/firestore'
import { useFirebase } from '../useFirebase'
import { defaultConverter } from './defaultConverter'

export interface QueryFilter {
  $limit?: number
  $startAt?: number
  $startAfter?: number
  $endAt?: number
  $endBefore?: number
  $orderBy?: string | string[]
  [x: string]: any
}

/**
 * Creates a Firestore query from a path and filter object or document id.
 * @param {string} path The path to the collection.
 * @param {string | QueryFilter} [filter] The query filter object or document id.
 * @param {FirestoreDataConverter<T>} [converter] A custom converter.
 * @returns {DocumentReference<T> | CollectionReference<T> | Query<T>} The query or document reference.
 */
export const createQuery = <T = DocumentData>(
  path: string,
  filter?: string | QueryFilter,
  converter = defaultConverter as FirestoreDataConverter<T>,
): DocumentReference<T> | CollectionReference<T> | Query<T> => {
  // --- Initialize variables.
  const { firestore } = useFirebase()
  const constraints: QueryConstraint[] = []

  // --- Resolve collection
  const colReference = collection(firestore, path).withConverter(converter)

  // --- Return a single document's reference & Abort early.
  if (typeof filter === 'string') return doc(colReference, filter)
  if (typeof filter === 'undefined') return doc(colReference)

  // --- Build constraints from object.
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
