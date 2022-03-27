import { getApp } from 'firebase/app'
import { HttpsCallableOptions, getFunctions, httpsCallable } from 'firebase/functions'

export const useFunctions = <T1, T2>(functionName: string, options = {} as HttpsCallableOptions) =>
  httpsCallable<T1, T2>(getFunctions(getApp()), functionName, options)
