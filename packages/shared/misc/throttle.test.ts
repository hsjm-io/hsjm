
import { expect, it } from 'vitest'
import { throttle } from './throttle'
import { delay } from './delay'

it('throttles a function so it is only called once every delay', async() => {
  let counter = 0
  const throttled = throttle(() => counter++, 10)

  // --- First cycle
  throttled()
  throttled()
  expect(counter).toBe(1)

  // --- Third cycle
  await delay(10)
  expect(counter).toBe(1)
  throttled()
  expect(counter).toBe(2)
})