//--- Import dependencies.
import type firebase from 'firebase/app'
import type { ComputedRef, Ref, UnwrapRef } from 'vue-demi'

/** Holds data about the current state of the upload task. */
export interface UseStoragePut {
    /** The reference that spawned this snapshot's upload task. */
    ref: firebase.storage.Reference;
    /** The short name of this object, which is the last component of the full path. */
    name: string;
    /** MD5 Hash of the file's content encoded in base64. */
    hash: string;
    /** The name of the bucket containing this reference's object. */
    bucket: string;
    /** The full path of this object. */
    fullPath: string;
    /** Long lived download URL for this object. */
    downloadURL: string;
}

/** Holds data about the current state of the upload task. */
export interface UseStorageUpload extends UseStoragePut {
    /** The `DocumentReference` linked to the file. */
    document: firebase.firestore.DocumentReference;
}

/** Composable object used to upload files with ease. */
export interface UseStorage {
    /** Represents the process of uploading an object. Allows you to monitor and manage the upload. */
    task: Ref<firebase.storage.UploadTask | undefined>
    /** Reactive progress percentage of the current upload. Goes from 0 to 1. */
    progress: ComputedRef<number>
    /** Status of the current upload task. */
    status: UnwrapRef<UsePutStatus>
    /** Pauses the running task. Has no effect on a paused or failed task. */
    pause: () => boolean
    /** Resumes a paused task. Has no effect on a running or failed task. */
    resume: () => boolean
    /** Cancels a running task. Has no effect on a complete or failed task. */
    cancel: () => boolean
    /**
     * Uploads data to this reference's location.
     * @param buffer The data to upload.
     * @param metadata Metadata for the newly uploaded object.
     */
    put: (buffer: Uint8Array | Blob | ArrayBuffer | File, metadata?: firebase.storage.UploadMetadata) => Promise<UseStoragePut>
    /**
     * Uploads data to this reference's location and add document in `Firestore` to track the uploaded file.
     * @param buffer The data to upload.
     * @param name The name of the file.
     * @param metadata Metadata for the newly uploaded object.
     */
    upload: (buffer: Uint8Array | Blob | ArrayBuffer | File, name?: string, metadata?: firebase.storage.UploadMetadata) => Promise<UseStorageUpload>
}

/** Object to store the tatus of an upload task. */
export interface UsePutStatus {
    /** The total number of bytes to be uploaded. */
    state: string
    /** The total number of bytes to be uploaded. */
    totalBytes: number
    /** The number of bytes that have been successfully uploaded so far. */
    bytesTransferred: number
}