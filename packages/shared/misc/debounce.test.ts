import { expect, it } from 'vitest'
import { debounce } from './debounce'
import { delay } from './delay'

it('debounces a function so it is only called once after delay', async() => {
  let counter = 0
  const debounced = debounce(() => counter++, 10)

  // --- First cycle
  debounced()
  debounced()
  expect(counter).toEqual(0)

  // --- Third cycle
  await delay(10)
  expect(counter).toEqual(1)
  debounced()
  expect(counter).toEqual(1)
})
