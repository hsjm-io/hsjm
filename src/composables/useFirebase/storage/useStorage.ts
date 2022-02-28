import type firebase from 'firebase/app'
import type { UnwrapRef, Ref } from 'vue-demi'
import type { UsePutStatus, UseStorage } from './types'
import { computed, reactive, ref } from 'vue-demi'
import { storage } from '.'
import { partial } from 'lodash-es'
import { bindPut, bindUpload } from './utils'

/**
 * Provide utilities for uploading files and tracking progress in `Firebase` storage.
 * @param path A relative path to initialize the reference with,
 * @param collectionPath Collection in wich the document tracking the file will be stored.
 * for example `path/to/image.jpg`. Defaults to the `files` collection.
 */
export const useStorage = (
    path?: string,
    collectionPath = 'files',
): UseStorage => {

    //--- Init reference to bucket path.
    const storageRef = storage().ref(path)
    const task: Ref<firebase.storage.UploadTask | undefined> = ref()

    //--- Initialize status reactive object.
    const status = reactive({
        state: 'PAUSED',
        totalBytes: 0,
        bytesTransferred: 0,
    }) as UnwrapRef<UsePutStatus>

    //--- Initialize progress computed.
    const progress = computed(() => status.bytesTransferred / status.totalBytes || 0)

    //--- Define instance methods.
    const put = partial(bindPut, storageRef, task, status)
    const upload = partial(bindUpload, storageRef, task, status, collectionPath)
    const pause = () => !!task.value?.pause()
    const resume = () => !!task.value?.resume()
    const cancel = () => !!task.value?.cancel()

    //--- Return `UsePut` object.
    return { task, progress, status, put, upload, pause, resume, cancel }
}