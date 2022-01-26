//--- Import dependencies.
import { createHash as _createHash } from 'crypto'

/**
 * Hash a buffer using MD5 algorithm and return it's base64 representation.
 * @param buffer Buffer to hash.
 */
 export const createHash = (buffer: ArrayBuffer): string => {
    return _createHash('md5')
        .update(Buffer.from(buffer))
        .digest()
        .toString('base64')
}
