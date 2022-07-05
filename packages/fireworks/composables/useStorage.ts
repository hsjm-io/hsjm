import { computed, reactive, ref } from 'vue-demi'
import {
  UploadMetadata, UploadTask, UploadTaskSnapshot, getDownloadURL,
  getStorage, ref as storageReference, uploadBytesResumable,
} from 'firebase/storage'

/**
 * Provide utilities for uploading files and tracking progress in `Firebase` storage.
 * @param path A relative path to initialize the reference with,
 * for example `path/to/image.jpg`. Defaults to the `files` collection.
 */
export const useStorage = (
  path?: string,
  metadata = {} as UploadMetadata,
) => {
  // --- Initialize status reactive object.
  const task = ref<UploadTask>()
  const status = reactive({
    state: 'PAUSED',
    totalBytes: 0,
    bytesTransferred: 0,
  })
  const progress = computed(() => status.bytesTransferred / status.totalBytes || 0)

  // --- Define instance methods.
  const put = async(data: Uint8Array | Blob | ArrayBuffer, _metadata = metadata) => {
    // --- Abort current upload task.
    task.value?.cancel && task.value?.cancel()

    // --- If `buffer` is `File` instance, extract it's metadata.
    if (data instanceof File) metadata.contentType = data.type

    // --- Start the upload
    const fileReference = storageReference(getStorage(), path)
    task.value = uploadBytesResumable(fileReference, data, _metadata)

    // --- Await for upload completion.
    return await new Promise((resolve, reject) => {
      task.value?.on('state_changed', {

        // --- Update status on snapshot progress.
        next: (snapshot: UploadTaskSnapshot) => {
          status.state = snapshot.state
          status.totalBytes = snapshot.totalBytes
          status.bytesTransferred = snapshot.bytesTransferred
        },

        // --- Resolve on complete.
        complete: async() => {
          const { name, bucket, fullPath } = fileReference
          const downloadURL = await getDownloadURL(fileReference)
          resolve({ name, bucket, fullPath, downloadURL })
        },

        // --- Error handler.
        error: error => reject(error),
      },
      )
    })
  }

  const pause = () => task.value?.pause()
  const resume = () => task.value?.resume()
  const cancel = () => task.value?.cancel()

  // --- Return `UsePut` object.
  return { status, progress, put, pause, resume, cancel }
}
