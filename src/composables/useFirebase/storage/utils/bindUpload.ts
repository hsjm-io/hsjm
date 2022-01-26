import type firebase from 'firebase/app'
import type { UnwrapRef, Ref } from 'vue-demi'
import type { UsePutStatus, UseStorageUpload } from '../types'
import { firestore } from '../../firestore'
import { bindPut } from './bindPut'
import { getCollectionReference } from '../../firestore/utils'

/**
 * Uploads data to this reference's location.
 * @param storageRef Reference for the given path in the default bucket.
 * @param task Reactive reference used to store the task object.
 * @param status Reactive object used to track the upload status.
 * @param collection Collection in wich the document tracking the file will be stored.
 * @param buffer The data to upload.
 * @param name The relative path from this reference. Leading, trailing, and consecutive slashes are removed.
 * @param hash MD5 hash of the file. It's also the relative of the file in the storage.
 * @param metadata Metadata for the newly uploaded object.
 */
 export const bindUpload = async (
    storageRef: firebase.storage.Reference,
    task: Ref<firebase.storage.UploadTask | undefined>,
    status: UnwrapRef<UsePutStatus>,
    collection = 'files' as string | firebase.firestore.CollectionReference,
    buffer: Uint8Array | Blob | ArrayBuffer,
    name = null as string | null,
    metadata = {} as Partial<firebase.storage.UploadMetadata>,
): Promise<UseStorageUpload> => {

    //--- Get file name.
    if(buffer instanceof File) name = buffer.name

    //--- Put the file in Firebase storage and keep dowload url and path.
    const useStoragePut = await bindPut(storageRef, task, status, buffer, metadata)

    //--- Update the document with the download url and the path.
    const { downloadURL,  fullPath, hash } = useStoragePut
    const documentData = { hash, name, downloadURL, fullPath }
    const document = await getCollectionReference(collection).add(documentData)

    return { ...useStoragePut, document }
}
