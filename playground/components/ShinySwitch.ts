import { Switch, customizeComponent } from '@hsjm/core'

export default customizeComponent(Switch, undefined, ({ active }) => ({
  class: `flex justify-center rounded-xl space-y-4 min-w-16 rounded-lg py-2 px-1 font-bold pointer-events-auto ${active ? 'bg-nord14' : 'bg-nord3'}`,
}))
