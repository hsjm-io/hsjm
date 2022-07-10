// @vitest-environment happy-dom
import { expect, it } from 'vitest'
import { useFirebase } from './useFirebase'

it('should return the firestore instances', async() => {
  const result = useFirebase({
    name: 'test',
    appCheckDebugToken: 'test',
    emulatorHost: 'localhost',
  })
  // @ts-expect-error: Missing `globalThis` definition.
  expect(globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN).toEqual('test')
  expect(result.name).toEqual('test')
})
