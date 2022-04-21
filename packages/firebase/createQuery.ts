import {
  CollectionReference, DocumentData, DocumentReference, Query,
  QueryConstraint, collection, doc, endAt,
  endBefore, getFirestore, limit, orderBy,
  query, startAfter, startAt, where,
} from 'firebase/firestore'

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
  <T extends DocumentData>(path: string, filter: {}): CollectionReference<T>
  <T extends DocumentData>(path: string, filter: QueryFilter): Query<T> | CollectionReference<T>
  <T extends DocumentData>(path: string, filter: string | null | undefined): DocumentReference<T>
  <T extends DocumentData>(path: string, filter: string | null | undefined | QueryFilter): DocumentReference<T> | Query<T> | CollectionReference<T>
}

/**
 * Create a `Query`, `DocumentReference` or `CollectionReference`.
 * @param path Collection path.
 * @param filter ID string or `QueryFilter`
 */
export const createQuery: CreateQuery = (path: string, filter: string | null | undefined | QueryFilter): any => {
  // --- Initialize variables.
  const constraints: QueryConstraint[] = []
  const colReference = collection(getFirestore(), path)

  // --- Return a single document's reference.
  if (typeof filter === 'string') return doc(colReference, filter)
  if (filter === null || filter === undefined) return doc(colReference)

  // --- Generate constraints from object.
  Object.entries(filter).forEach(([key, value]) => {
    switch (key) {
      case '$limit': constraints.push(limit(value)); break
      case '$startAt': constraints.push(startAt(value)); break
      case '$startAfter': constraints.push(startAfter(value)); break
      case '$endAt': constraints.push(endAt(value)); break
      case '$endBefore': constraints.push(endBefore(value)); break
      case '$orderBy': constraints.push(orderBy(value)); break
      default: if (key.endsWith('_lt')) constraints.push(where(key.replace('_lt', ''), '<', value))
      else if (key.endsWith('_lte')) constraints.push(where(key.replace('_lte', ''), '<=', value))
      else if (key.endsWith('_ne')) constraints.push(where(key.replace('_ne', ''), '!=', value))
      else if (key.endsWith('_gt')) constraints.push(where(key.replace('_gt', ''), '>', value))
      else if (key.endsWith('_gte')) constraints.push(where(key.replace('_gte', ''), '>=', value))
      else if (key.endsWith('_in')) constraints.push(where(key.replace('_in', ''), 'in', value))
      else if (key.endsWith('_nin')) constraints.push(where(key.replace('_nin', ''), 'not-in', value))
      else if (key.endsWith('_ac')) constraints.push(where(key.replace('_ac', ''), 'array-contains', value))
      else if (key.endsWith('_aca')) constraints.push(where(key.replace('_aca', ''), 'array-contains-any', value))
      else constraints.push(where(key, '==', value))
    }
  })

  // --- Return query.
  return constraints.length > 0
    ? query(colReference, ...constraints)
    : colReference
}
