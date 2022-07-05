import { HttpsCallable, HttpsCallableOptions, getFunctions, httpsCallable } from 'firebase/functions'

export interface useFunctionOptions extends HttpsCallableOptions {
  /**
   * one of:
   * - a) The region the callable functions are located in (ex: us-central1)
   * - b) A custom domain hosting the callable functions (ex: https://mydomain.com)
   */
  regionOrCustomDomain?: string
}

/**
 * Instanciate a callable Firebase Functions
 * @param {string} functionName The name of the function.
 * @param {UseFunctionsOptions} options The options to pass to the function.
 * @returns {HttpsCallable} An callable function calling the Firebase function.
 */
export const useFunction = /* @__PURE__ */ <T1, T2>(functionName: string, options: useFunctionOptions = {}): HttpsCallable<T1, T2> => {
  // --- Get app context.
  const functions = getFunctions(undefined, options.regionOrCustomDomain)
  if (!functions) throw new Error('Firebase Functions client not found')

  // --- Return the callable function.
  return httpsCallable<T1, T2>(functions, functionName, options)
}
