// @vitest-environment happy-dom
import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue-demi'
import { exposeToDevtool } from './exposeToDevtool'

const Component = defineComponent({
  setup() {
    exposeToDevtool({ foo: 'bar' })
    return () => h('div')
  },
})

it('should expose an object to the Vue Devtools', async() => {
  const wrapper = mount(Component)
  await nextTick()
  // @ts-expect-error: ignore
  expect(wrapper.getCurrentComponent().setupState).toEqual({ foo: 'bar' })
})

it('should return the exposed object', () => {
  const result = exposeToDevtool({ foo: 'bar' })
  expect(result).toEqual({ foo: 'bar' })
})
