import { expect, it } from 'vitest'
import { useFunction } from './useFunction'
import './utils/fixtures'

it('should be able to call a function', async() => {
  const add = useFunction<number[], number>('add')
  expect(await add([1, 2])).toEqual({ data: 3 })
})

it('should be able to call a function with options', async() => {
  const add = useFunction<number[], number>('add', { timeout: 30000 })
  expect(await add([1, 2])).toEqual({ data: 3 })
})
