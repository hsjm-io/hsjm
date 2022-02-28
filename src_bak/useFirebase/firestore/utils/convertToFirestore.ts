
import { useStorage } from '../../storage'
import { UseFirestoreDocument, UseFirestoreOptions } from '../types'

export const convertFieldToFirestore = async (
    value: any
): Promise<any> => {

    //--- Instantiate file uploader.
    const { upload } = useStorage()

    //--- Upload file and give file ref.
    if(value instanceof Blob
        || value instanceof File
        || value instanceof Uint8Array
        || value instanceof ArrayBuffer) {
        const { downloadURL } = await upload(value)
        return downloadURL
    }
    
    if(value instanceof Array) 
        value.map(async v => await convertFieldToFirestore(v))
    
    //--- Replace `undefiend` with `null`.
    if(value === undefined) return null

    //--
    return value
}

/**
 * 
 */
 export const convertToFirestore = async (
    data: UseFirestoreDocument,
    options?: UseFirestoreOptions,
 ): Promise<UseFirestoreDocument> => {

    //--- Clone and remove ID and ref.
    data = { ...data }

    //--- Map fields.
    for(const field in data)
        data[field] = await convertFieldToFirestore(data[field])

    //--- Return data
    return data
}