<script setup lang="ts">
import { Button, Switch, Table, customizeComponent, Input } from '@hsjm/core'

const log = () =>console.log()

const switchValue = ref(false)
const ShinySwitch = customizeComponent(
  Switch,
  undefined,
  ({ active }) => ({
    class: `flex justify-center rounded-xl space-y-4 min-w-16 rounded-lg py-2 px-1 font-bold pointer-events-auto ${active ? 'bg-nord14' : 'bg-nord3'}`,
  })
)

const { data: posts } = await useFetch('https://jsonplaceholder.typicode.com/posts')
const postColumns = {
  id: { name: 'Post ID', onClick: console.log  },
  title: { name: 'Title' },
}
const ShinyTable = customizeComponent(Table, { 
  class: 'w-full overflow-hidden',
  classHeaderCell: 'p-3 text-left font-bold opacity-33 border-b-2 border-b-nord3',
  classCell: 'p-3 first:rounded-l-xl last:rounded-r-xl w-full truncate',
  classRow: 'hover:bg-nord3 !rounded-lg text-left truncate transition-all cursor-pointer',
})

const ShinyInput = customizeComponent(Input, {
  class: 'flex flex-col space-y-2',
  classInput: 'text-base h-8 rounded bg-nord3 p-2',
  classLabel: 'text-sm',
  classError: 'text-sm text-red-500',
  classMessage: 'text-sm text-white/50',
  classGroup: 'flex items-center space-x-4',
})
</script>

<template>
<div class="bg-nord1 min-h-screen text-white flex flex-col items-center justify-center p-8">
  <section class="lg:container space-y-4 overflow-visible px-8">
    <div class="grid grid-cols-2 gap-8">

      <!-- Switch -->
      <div class="border-2 border-nord3 rounded-lg p-8 space-y-4">
        <h3 class="text-3xl font-bold">The switch.</h3>
        <p class="text-base">
          Switches are a pleasant interface for toggling a value between two states,
          and offer the same semantics and keyboard navigation as native checkbox elements.
        </p>
        <ShinySwitch v-model="switchValue" value="foo" class="w-16">Foobar</ShinySwitch>
        <ShinySwitch v-model="switchValue" value="bar" class="w-16">Barfoo</ShinySwitch>
      </div>

      <!-- Table -->
      <div class="border-2 border-nord3 rounded-lg p-8 space-y-4">
        <h3 class="text-3xl font-bold">The table.</h3>
        <p class="text-base">
          Tables components helps you build nice looking and functional tables. They provide
          an easy way to handle the rendering of headers, cells, and a footer.
        </p>
        <ShinyTable
          :rows="posts.slice(0, 3)"
          :columns="postColumns"
          @click-row="log($event.body)"
        >

          <!-- Title -->
          <template v-slot:cell-id="{ value }">
            <div class="px-2 py-1 bg-nord2 text-center">{{ value }}</div>
          </template>

          <template v-slot:cell-title="{ value }">
            {{ value }}
          </template>
        </ShinyTable>
      </div>

      <!-- Input -->
      <div class="border-2 border-nord3 rounded-lg p-8 space-y-4">
        <h3 class="text-3xl font-bold">The input.</h3>
        <p class="text-base">
          The input component is a wrapper to the native HTML input element with
          no custom styling but a shitload of additional functionality.
        </p>
        <ShinyInput label="Email" message="Provide valid email address">
        </ShinyInput>
      </div>

      <!-- Button -->
      <div class="border-2 border-nord3 rounded-lg p-8 space-y-4">
        <h3 class="text-3xl font-bold">The button.</h3>
        <p class="text-base">
          Foobar and shits
        </p>
        <Button class="btn btn-nord4">
        </Button>
      </div>


    </div>
  </section>
</div>
</template>
