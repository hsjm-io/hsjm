// @vitest-environment happy-dom
import { expect, it } from 'vitest'
import { nextTick, ref } from 'vue-demi'
import { until } from '@vueuse/shared'
import { useIconify } from './useIconify'

it('returns an svg ref', async() => {
  const icon = useIconify('carbon:arrow-right')
  expect(icon.value).toBeUndefined()
  await until(icon).not.toBeUndefined({ timeout: 1000 })
  expect(icon.value).toMatch('<svg xmlns=')
})

it('updates the svg when props change', async() => {
  const iconName = ref('mdi:check')

  const icon = useIconify(iconName)
  await until(icon).not.toBeUndefined({ timeout: 1000 })
  const firstIcon = icon.value
  expect(icon.value).toBeDefined()
  expect(icon.value).toMatch('<svg xmlns=')

  iconName.value = 'mdi:account'
  await nextTick()
  await until(icon).not.toBeUndefined({ timeout: 1000 })
  expect(icon.value).toBeDefined()
  expect(icon.value).toMatch('<svg xmlns=')
  expect(icon.value).not.toEqual(firstIcon)
})
