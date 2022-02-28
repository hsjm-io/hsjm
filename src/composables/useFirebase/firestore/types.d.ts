import type firebase from 'firebase/app'
import type { Ref, ComputedRef } from 'vue-demi'
import type { MaybeRef } from '@vueuse/core'

export type UseFirestoreQuery = 
    firebase.firestore.CollectionReference |
    firebase.firestore.DocumentReference |
    firebase.firestore.Query |
    undefined

export interface UseFirestoreDocument extends firebase.firestore.DocumentData {
    /** The `DocumentReference` for the document referenced in the `DocumentSnapshot`. */
    ref?: firebase.firestore.DocumentReference
    /** Property of the `DocumentSnapshot` that provides the document's ID. */
    id?: string
}

export type UseFirestoreSnapshot = 
    firebase.firestore.DocumentSnapshot |
    firebase.firestore.QuerySnapshot |
    firebase.firestore.QueryDocumentSnapshot

interface UseFirestoreOptions extends 
    Partial<firebase.firestore.GetOptions>,
    Partial<firebase.firestore.SetOptions>,
    Partial<firebase.firestore.SnapshotOptions>
{
    /** Initial value of the data. */
    initialValue?: MaybeRef<UseFirestoreDocument | UseFirestoreDocument[] | undefined>
    /** autoFetch the data using `@nuxtjs/composition-api`'s `useFetch` on init. */
    autoFetch?: boolean
    /** Unsubscribe from the `onSnapshot` event handler on scope dispose. */
    autoDispose?: boolean
    /** Call the method `onSnapshot` on init. */
    autoSubscribe?: boolean
    /** Take the first item from data array */
    takeFirst?: boolean
    /** Fetch the data of the sub-references contained in the document(s). */
    recursive?: boolean | number
    /** Generic error handler. */
    errorHandler?: (error: firebase.firestore.FirestoreError) => void
}

export interface UseFirestore {
    /** 
     * Reactive variable containing the fetched data.
     */
    data: Ref<UseFirestoreDocument | UseFirestoreDocument[] | undefined>
    /** 
     * Query used to fetch the data.
     */
    query: UseFirestoreQuery | ComputedRef<UseFirestoreQuery>
    /** 
     * Loading state of async functions.
     */
    loading: Ref<boolean>
    /**
     * Executes the query and save the data in the `data` reactive variable.
     * 
     * Note: By default, `get()` attempts to provide up-to-date data when
     * possible by waiting for data from the server, but it may return
     * cached data or fail if you are offline and the server cannot be
     * reached. This behavior can be altered via the `GetOptions` parameter.
     * @param options An object to configure the get behavior.
     */
    get: (options?: UseFirestoreOptions) => Promise<void>
    /**
     * Attaches a listener for `QuerySnapshot` events and save results in the
     * `data` reactive variable. You may either pass an `onError` callback by defining
     * the `options.onError` property. The listener can be auto-cancelled by
     * setting `options.autoDispose: true`. This function will return a `Promise` that
     * will be resolved the first time the data is received.
     * @param options Options to use.
     */
    onSnapshotAsync: (options?: UseFirestoreOptions) => void
    /**
     * Attaches a listener for `QuerySnapshot` events and save results in the
     * `data` reactive variable. You may either pass an `onError` callback by defining
     * the `options.onError` property. The listener can be auto-cancelled by
     * setting `options.autoDispose: true`.
     * @param options Options to use.
     */
    onSnapshot: (options?: UseFirestoreOptions) => void
}

export interface UseDocument extends UseFirestore {
    data: Ref<UseFirestoreDocument | undefined>
    /** 
     * A `DocumentReference` refers to a document location in a Firestore
     * database and can be used to write, read, or listen to the location.
     * The document at the referenced location may or may not exist.
     * A `DocumentReference` can also be used to create a `CollectionReference`
     * to a subcollection.
     */
    ref: firebase.firestore.DocumentReference | ComputedRef<firebase.firestore.DocumentReference>
    /**
     * Writes to the document referred to by this `DocumentReference`.
     * If the document does not yet exist, it will be created.
     * If you pass `SetOptions`, the provided data can be merged
     * into an existing document.
     * @param options An object to configure the set behavior.
     */
    save: (options: firebase.firestore.SetOptions) => Promise<void>
    /** 
     * Deletes the document referred to by this `DocumentReference`. 
     */
    remove: () => Promise<void>
    /** 
     * Clone a document in the same collection, assigning it a document ID automatically. 
     */
    clone: () => Promise<firebase.firestore.DocumentReference>
}

export interface UseCollection extends UseFirestore {
    data: Ref<UseFirestoreDocument[] | undefined>
    /** 
     * A `CollectionReference` object can be used for adding documents,
     * getting document references, and querying for documents
     * (using the methods inherited from `Query`).
     */
    ref: MaybeRef<firebase.firestore.CollectionReference>
    /**
     * Writes to the document referred to by this `DocumentReference`.
     * If the document does not yet exist, it will be created.
     * If you pass `SetOptions`, the provided data can be merged
     * into an existing document.
     * @param options An object to configure the set behavior.
     */
    save: (options: UseFirestoreOptions) => Promise<firebase.firestore.DocumentReference[]>
    /**
     * Add a new document to this collection with the specified data,
     * assigning it a document ID automatically.
     * @param documentData An array of the documents to save.
     */
    add: () => Promise<firebase.firestore.DocumentReference>
    // /** Get a document from the colleciton using it's path. */
    // doc: (documentPath: MaybeRef<string>) => Promise<UseDocument>
}

export interface UseQuery extends UseFirestore {
    /** 
     * A `Query` refers to a Query which you can read or listen to.
     * You can also construct refined `Query` objects by adding filters
     * and ordering.
     */
    query: ComputedRef<firebase.firestore.Query>
}

export interface UseFirestoreFilter {
    /** 
     * Creates and returns a new `Query` that ends at the provided set of field values relative to
     * the order of the query. The order of the provided values must match the order of the order
     * by clauses of the query.
     * 
     * The snapshot of the document the query results should end at or the field values to
     * end this query at, in order of the query's order by.
     */
    limit?: number
    /** Creates and returns a new `Query` that only returns the last matching documents.
     * 
     * You must specify at least one `orderBy` clause for `limitToLast` queries, otherwise an exception will be thrown during execution.
     * Results for `limitToLast` queries cannot be streamed via the `stream()` API. 
     */
    limitToLast?: number
    /** 
     * Creates and returns a new Query that's additionally sorted by the specified field,
     */
    orderBy?: string | firebase.firestore.FieldPath
    /** 
     * Optional direction to sort by ('asc' or 'desc'). 
     * If not specified, order will be ascending.
     */
    orderDir?: 'desc' | 'asc'
    /** 
     * Creates and returns a new Query with the additional filter that documents must
     * contain the specified field and the value should satisfy the relation constraint
     * provided.
     * 
     * Operator used are specified in the key.
     * - field_eq: value => ('field', '==', value)
     */
    [x: string]: MaybeRef<any>
}