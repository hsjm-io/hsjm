import { getVariable, hashMd5, pick, toArrayBuffer, toBase64 } from '@hsjm/shared'

export const createSignature = (data: Record<string, any> = {}) => {
  const secret = getVariable('FIREWORKS_SECRET', String) ?? 'SECRET'

  // --- Build signature.
  data = pick(data, (value, key) => !/(^__)|(At$)/.test(key))
  const dataBuffer = new Uint8Array(toArrayBuffer(data))
  const secretBuffer = new Uint8Array(toArrayBuffer(secret))
  const signatureBuffer = new Uint8Array([...dataBuffer, ...secretBuffer])

  // --- Hash signature.
  const dataMd5 = hashMd5(signatureBuffer.buffer)
  return toBase64(dataMd5)
}
