/* eslint-disable unicorn/prefer-switch */
import { CollectionReference, DocumentData, DocumentReference, OrderByDirection, Query, QueryConstraint, collection, doc, endAt, endBefore, getFirestore, limit, limitToLast, orderBy, query, startAfter, startAt, where } from 'firebase/firestore'
import { Key, MaybeArray, Value, arrayify, isNotNil } from '@hsjm/shared'
import { FirebaseApp } from 'firebase/app'

// --- Base query filter
export type QueryFilter<T = DocumentData> = {
  $limit?: number
  $limitToLast?: number
  $startAt?: number
  $startAfter?: number
  $endAt?: number
  $endBefore?: number
  $orderBy?: MaybeArray<keyof T | [keyof T, OrderByDirection]>
  [key: string]: any
} & {
  [ K in `${Key<T>}${'_lt' | '_lte' | '_ne' | '_gt' | '_gte' | '_in' | '_nin' | '_ac' | '_aca'}`]?: Value<T, K>
}

/**
 * Creates a Firestore query from a path and filter object or document id.
 * @param {FirebaseApp} [this] The Firebase app to use.
 * @param {string} path The path to the collection.
 * @param {string | QueryFilter} [filter] The query filter object or document id.
 * @returns {DocumentReference | Query} The Firestore query or document reference.
 */
export function firestoreCreateQuery<T = DocumentData>(path: string, filter: QueryFilter<T>): Query<T>
export function firestoreCreateQuery<T = DocumentData>(path: string, filter?: string): DocumentReference<T>
export function firestoreCreateQuery<T = DocumentData>(path: string, filter?: string | QueryFilter<T>): DocumentReference<T> | Query<T>
export function firestoreCreateQuery<T = DocumentData>(this: FirebaseApp | undefined, path: string, filter?: string | QueryFilter<T>): DocumentReference<T> | Query<T> {
  // --- Handle edge cases.
  if (!path) throw new Error('[firestoreCreateQuery] Path is not defined.')

  // --- Resolve collection or document reference.
  const firestore = getFirestore(this)
  const colReference = collection(firestore, path) as CollectionReference<T>
  if (typeof filter === 'string') return doc(colReference, filter)
  if (typeof filter === 'undefined') return doc(colReference)

  // --- Build constraints from `QueryFilter`.
  const constraints: QueryConstraint[] = []
  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined) continue
    else if (key === '$limit') constraints.push(limit(Number.parseInt(value.toString())))
    else if (key === '$limitToLast') constraints.push(limitToLast(Number.parseInt(value.toString())))
    else if (key === '$startAt') constraints.push(startAt(value))
    else if (key === '$startAfter') constraints.push(startAfter(value))
    else if (key === '$endAt') constraints.push(endAt(value))
    else if (key === '$endBefore') constraints.push(endBefore(value))
    else if (key === '$orderBy') constraints.push(...arrayify(value).map((v: any) => (Array.isArray(v) ? orderBy(v[0], v[1]) : orderBy(v))))
    else if (key.endsWith('_lt')) constraints.push(where(key.replace('_lt', ''), '<', value))
    else if (key.endsWith('_lte')) constraints.push(where(key.replace('_lte', ''), '<=', value))
    else if (key.endsWith('_ne')) constraints.push(where(key.replace('_ne', ''), '!=', value))
    else if (key.endsWith('_gt')) constraints.push(where(key.replace('_gt', ''), '>', value))
    else if (key.endsWith('_gte')) constraints.push(where(key.replace('_gte', ''), '>=', value))
    else if (key.endsWith('_in')) constraints.push(where(key.replace('_in', ''), 'in', value))
    else if (key.endsWith('_nin')) constraints.push(where(key.replace('_nin', ''), 'not-in', value))
    else if (key.endsWith('_ac')) constraints.push(where(key.replace('_ac', ''), 'array-contains', value))
    else if (key.endsWith('_aca')) constraints.push(where(key.replace('_aca', ''), 'array-contains-any', value))
    else if (key.trim().length > 0 && isNotNil(value)) constraints.push(where(key, '==', value))
  }

  // --- Return query.
  return query(colReference, ...constraints)
}
