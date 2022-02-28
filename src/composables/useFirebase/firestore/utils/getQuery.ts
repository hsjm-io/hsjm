//--- Import dependendies.
import type firebase from 'firebase/app'
import type { UseFirestoreFilter } from '../types'
import { unref } from 'vue-demi'
import { getCollectionReference } from './getCollectionReference'

/**
 * Creates and returns a new Query with the additional filter that documents must
 * satisfy the relation constraint provided.
 * @param collection A slash-separated path to a collection.
 * @param filter An object containing the filtering parameters.
 */
export const getQuery = (
    collection: firebase.firestore.CollectionReference | string,
    filter: UseFirestoreFilter
): firebase.firestore.Query | undefined => {
    if(!collection) return undefined

    //---  Initialize query & destructure query parameters.
    let query = getCollectionReference(collection) as firebase.firestore.Query
    const { limit, limitToLast, orderBy, orderDir, ...wheres } = filter

    //--- Apply where conditions.
    for(const key in wheres){
        
        //--- Split 'field_op' into ['field', 'op']
        const [ fieldPath, op ] = key.split('_') as [string, string]
        const filterValue = unref(wheres[key]) as string

        //--- Translate operations.
        const opStr = ({
            eq: '==',
            ne: '!=',
            lt: '<',
            gt: '>',
            lte: '<=',
            gte: '>=',
            in: 'in',
            nin: 'not-in',
            all: 'array-contains',
            any: 'array-contains-any'
        }[op] ?? '==') as firebase.firestore.WhereFilterOp

        //--- Debug used arguments.
        // console.log(`'${fieldPath}', '${opStr}', '${JSON.stringify(filterValue)}'`)

        //--- Apply where conditions.
        query = query.where(fieldPath, opStr, filterValue)
    }

    //--- Limit, offset and order
    if(orderBy) query = query.orderBy(orderBy, orderDir)
    if(limit) query = query.limit(limit)
    if(limitToLast) query = query.limitToLast(limitToLast)

    //--- Return query.
    return query
}