import { IconifyJSON } from '@iconify/iconify'
import { expandIconSet } from '@iconify/utils'

// --- Cached data.
const cachedCollections: Record<string, Promise<IconifyJSON>> = {}

/**
 * Retrieve a set of icons from a remote source.
 * @param collectionName Name of the collection.
 */
export const fetchCollection = (collectionName: string) => {
  // --- Get from cache if exists.
  if (collectionName in cachedCollections)
    return cachedCollections[collectionName]

  // --- Fetch collection data from remote.
  const collection = fetch(`https://raw.githubusercontent.com/iconify/icon-sets/master/json/${collectionName}.json`)
    .then(async(response) => {
      const data = await response.json()
      expandIconSet(data)
      return data
    })

  // --- Cache and return collection data.
  return (cachedCollections[collectionName] = collection)
}
