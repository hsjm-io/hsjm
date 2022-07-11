/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable unicorn/prefer-switch */
import { DocumentData, DocumentReference, Firestore, OrderByDirection, Query, QueryConstraint, collection, doc, endAt, endBefore, getFirestore, limit, limitToLast, orderBy, query, startAfter, startAt, where } from 'firebase/firestore'
import { Key, MaybeArray, Value, arrayify, isNotNil } from '@hsjm/shared'
import { FirebaseApp } from 'firebase/app'

// --- Field filters suffixes
export type QueryFilterSuffix = '_lt' | '_lte' | '_ne' | '_gt' | '_gte' | '_in' | '_nin' | '_ac' | '_aca'

// --- Base query filter
export type QueryFilter<T> = {
  $limit?: number
  $limitToLast?: number
  $startAt?: number
  $startAfter?: number
  $endAt?: number
  $endBefore?: number
  $orderBy?: MaybeArray<keyof T | [keyof T, OrderByDirection]>
  [key: string]: any
} & {
  [ K in `${Key<T>}${QueryFilterSuffix}`]?: Value<T, K>
}

// --- Query options.
export interface CreateQueryOptions {
  /** The Firebase app to use. */
  app?: FirebaseApp
  /** The Firestore instance to use. */
  firestore?: Firestore
}

// --- Overloads.
export interface CreateQuery {
  <T = DocumentData>(path: string, id?: string): DocumentReference<T>
  <T = DocumentData>(path: string, filter: QueryFilter<T>): Query<T>
  <T = DocumentData>(path: string, idOrFilter?: string | QueryFilter<T>): DocumentReference<T> | Query<T>
}

/**
 * Creates a Firestore query from a path and filter object or document id.
 * @param path The path to the collection.
 * @param filter The query filter object or document id.
 * @param options The options to use.
 * @returns The query or document reference.
 */
export const createQuery: CreateQuery = (path: string, filter?: string | Record<string, any>, options: CreateQueryOptions = {}): any => {
  // --- Destructure and default options.
  const { firestore = getFirestore(options.app) } = options

  // --- Resolve collection or document reference.
  const colReference = collection(firestore, path)
  if (typeof filter === 'string') return doc(colReference, filter) as any
  if (typeof filter === 'undefined') return doc(colReference) as any

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
  return query(colReference, ...constraints) as any
}
