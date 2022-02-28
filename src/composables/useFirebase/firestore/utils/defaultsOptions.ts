import { UseFirestoreOptions } from '../types'
import { defaults } from 'lodash-es'

/**
 * Get a `UseFirestoreOptions` object injected with the default values.
 * @param options Custom options.
 */
 export const defaultsOptions = (
    options?: Partial<UseFirestoreOptions>
): UseFirestoreOptions => {
    
    //--- Define default options.
    const optionsDefault: UseFirestoreOptions = {
        initialValue: undefined,
        autoFetch: true,
        autoDispose: true,
        autoSubscribe: true,
        recursive: true,
        takeFirst: false,
        errorHandler: console.error,
    }
    
    //--- Return defaulted options.
    return defaults(options, optionsDefault)
}