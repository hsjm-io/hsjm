import { IconifyJSON } from '@iconify/iconify';
import { expandIconSet } from '@iconify/utils';
import axios from 'axios';

// --- Cached data.
const cachedCollections: Record<string, Promise<IconifyJSON>> = {};

/**
 * Retrieve a set of icons from a remote source.
 * @param collectionName Name of the collection.
 */
export const fetchCollection = (collectionName: string) => {

  // --- Get from cache if exists.
  if (collectionName in cachedCollections)
    return cachedCollections[collectionName];

  // --- Fetch collection data from remote.
  const collection = axios
    .get<IconifyJSON>(`https://raw.githubusercontent.com/iconify/icon-sets/master/json/${collectionName}.json`)
    .then(res => { expandIconSet(res.data); return res.data; });

  // --- Cache and return collection data.
  return (cachedCollections[collectionName] = collection);
};
