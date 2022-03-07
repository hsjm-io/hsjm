import { btoa } from "buffer";

/**
 * 
 * @param data 
 * @param seed 
 */
 export const hashCyrb53 = (data: string, seed = Math.random()) => {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < data.length; i++) {
      ch = data.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909)
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1>>>0)).toString(32)
}

/**
 * Hash a buffer or string and return it's base64 representation.
 * @param data String or buffer to hash.
 * @param algorithm Hashing algorithm
 */
 export const hash = (data: string | ArrayBuffer, algorithm = 'cybr53' as string): string => {
  data = typeof data !== 'string' ? Buffer.from(data).toString() : data
  return hashCyrb53(data)
}
