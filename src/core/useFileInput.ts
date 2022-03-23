import type { MaybeRef } from '@vueuse/shared'
import { computed, isRef, ref, unref } from 'vue-demi'

type UseFileInputValue = Array<string | File> | string | File | undefined

interface UseFileInputOptions {
  /** Sets or retrieves the Boolean value indicating whether multiple items can be selected from a list. */
  multiple?: HTMLInputElement['multiple']
  /** Sets or retrieves a comma-separated list of content types. */
  accept?: HTMLInputElement['accept']
  /** Upload method that must return an URL. */
  upload?: (file: File) => Promise<string>
}

export const useFileInput = (
  initialValue: MaybeRef<UseFileInputValue>,
  options = {} as MaybeRef<UseFileInputOptions>,
) => {

  //--- Initialize file array reference.
  const files = isRef(initialValue) ? initialValue : ref(initialValue)

  //--- Set or concat.
  const add = async (fileList: FileList, _options = options as MaybeRef<UseFileInputOptions>) => {

    //--- Unref and destructure options.
    const { upload } = unref(_options)

    //--- Cast FileList to Array.
    let fileArray: Array<File | string> = []
    for(let i = 0; i < fileList.length; i++)
      fileArray.push(fileList.item(i) as File)
    
    //--- Upload files using the provided utility.
    fileArray = upload 
      ? await Promise.all((fileArray as File[]).map(upload))
      : fileArray

    files.value = (files.value instanceof Array)
      ? files.value.concat(fileArray)
      : fileArray[0]
  }

  //--- Remove at index.
  const remove = (index: number): UseFileInputValue => files.value = (files.value instanceof Array)
    ? files.value.filter((v,k) => k !== index)
    : undefined

  //--- Ask user for  files.
  const prompt = (_options = options as MaybeRef<UseFileInputOptions>) => {

    //--- Unref and destructure options.
    const { multiple, accept } = unref(_options)

    //--- Create and configure input.
    const input = document.createElement('input')
    input.type = 'file'
    if(accept) input.accept = accept
    if(multiple) input.multiple = multiple

    // @ts-ignore --- Add handler and show native file explorer.
    input.onchange = (event: Event) => add(event.target.files)
    input.click()
  }

  //--- Computed function to get all thumbnails.
  const thumbnails = computed((): string[] => {

    //--- Utility to convert item to string.
    const getThumbnail = (item: File | string): string => {
      if(item instanceof File) return URL.createObjectURL(item)
      return item
    }
    
    //--- Return URL or array of URLs.
    return files.value instanceof Array
      ? files.value?.map(getThumbnail)
      : [getThumbnail(files.value as any)]
  })

  //--- Computed function to get the first thumbnail.
  const thumbnail = computed(() => thumbnails.value?.unshift())

  //--- Return useables reactive variables and methods.
  return { files, thumbnails, thumbnail, prompt, add, remove }
}
