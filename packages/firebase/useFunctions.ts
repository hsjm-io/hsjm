import { HttpsCallableOptions, httpsCallable } from 'firebase/functions'
import { useFirebase } from './useFirebase'

export const useFunctions = <T1, T2>(functionName: string, options?: HttpsCallableOptions) => {
  const { functions } = useFirebase()
  return httpsCallable<T1, T2>(functions, functionName, options)
}
