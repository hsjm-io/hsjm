import type firebase from 'firebase/app'
import type { UnwrapRef, Ref } from 'vue-demi'
import type { UsePutStatus,  UseStoragePut } from '../types'
import { toBuffer, createHash } from '../../utils'

/**
 * Uploads data to this reference's location.
 * @param storageRef Reference for the given path in the default bucket.
 * @param task Reactive reference used to store the task object.
 * @param status Reactive object used to track the upload status.
 * @param buffer The data to upload.
 * @param hash MD5 hash of the file. It's also the relative of the file in the storage.
 * @param metadata Metadata for the newly uploaded object.
 */
 export const bindPut = async (
    storageRef: firebase.storage.Reference,
    task: Ref<firebase.storage.UploadTask | undefined>,
    status: UnwrapRef<UsePutStatus>,
    buffer: Uint8Array | Blob | ArrayBuffer | File,
    metadata = {} as firebase.storage.UploadMetadata,
): Promise<UseStoragePut> => {

    //--- If `buffer` is `File` instance, extract it's metadata.
    if(buffer instanceof File) metadata.contentType = buffer.type

    //--- Cast to buffer and compute hash if no name is provided.
    buffer = await toBuffer(buffer)
    const hash = createHash(buffer)

    //--- Start the upload
    task.value = storageRef.child(hash).put(buffer, metadata)

    //--- Await for upload completion.
    return await new Promise((resolve, reject) => {
        task.value?.on('state_changed', {

            //--- Update status on snapshot progress.
            next: (snapshot: firebase.storage.UploadTaskSnapshot)  => {
                status.state = snapshot.state
                status.totalBytes = snapshot.totalBytes
                status.bytesTransferred = snapshot.bytesTransferred
            },

            //--- Resolve on complete.
            complete: async () => {
                // @ts-ignore
                const fileRef = task.value.snapshot.ref
                const { name, bucket, fullPath } = fileRef
                const downloadURL = await task.value?.snapshot.ref.getDownloadURL()
                resolve({ref: fileRef, name, hash, bucket, fullPath, downloadURL})
            },

            //--- Error handler.
            error: error => reject(error),
        }
    )})
}
