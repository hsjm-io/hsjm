export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max)

export const uniq = <T>(array: T[]) =>
  [...new Set(array)]

export const isNil = (value: any): value is undefined | null =>
  value !== null && value !== undefined

export const isNotNil = <T>(value: T): value is Exclude<T, undefined | null> =>
  value !== null && value !== undefined

export const compact = <T>(array: T[]) =>
  uniq(array.filter(isNotNil))

export const noop = () => {}

export const noopAsync = async() => {}
