<script setup lang="ts">
import { Input, Button, Icon, Editor, Markdown } from '@hsjm/core'

const value = ref('Eliseo@gardner.biz')
const inputTextValue = ref()

const selectItems = [
  { key: 'a', label: 'A', value: {id: 'AAAAAAAAA' } },
  { key: 'b', label: 'B', value: {id: 'BBBBBBBBB' } },
  { key: 'c', label: 'C', value: {id: 'CCCCCCCCC' } }
]

const allComments = asyncComputed(async() => {
  const results = await fetch('https://jsonplaceholder.typicode.com/comments')
  const data = await results.json()
  return data.slice(0, 7)
})

const isCommenter = async(value: string) => {
  const result = await fetch(`https://jsonplaceholder.typicode.com/comments?email=${value}`)
  const data = await result.json()
  console.count('FETCH')
  return data.length > 0
}

const inputBaseProps = {
  // message: '',
  class: "flex flex-col mt-4 relative",
  classGroup: "relative flex items-center bg-nord2 w-full h-12 children:not-last:mr-4 px-4 rounded-lg mt-2 focus-within:ring-2 hover:ring-4 ring-0 ring-nord10 transition-all-50",
  classInput: "flex flex-grow items-center rounded-lg  h-full bg-transparent outline-none",
  classLabel: "font-bold ml-2",
  classMessage: "text-xs text-nord4 mt-2 px-2",
  classError: "text-xs text-red-300 mt-2 px-2",
  classItem: "flex-grow px-2 py-1 rounded-full font-bold text-sm bg-nord10 max-w-32 whitespace-nowrap overflow-hidden truncate not-last:mr-4",
  classSearch: "flex-grow bg-transparent text-white h-full outline-none",
  classList: "absolute left-0 top-15 w-full children:not-first:mt-4 bg-nord3 z-10 p-4 rounded-lg outline-none",
  classListItem: "bg-nord2 rounded-lg p-2 ring-2 ring-transparent selected:bg-nord10 select-none cursor-pointer",
  classOption: "text-black",
  transitionItems: {
    moveClass: 'transition-all-200',
    enterActiveClass: 'transition-all-200 relative',
    leaveActiveClass: 'transition-all-200 absolute',
    enterFromClass: 'opacity-0',
    leaveToClass: 'opacity-0',
  },
  transitionList: {
    enterActiveClass: 'transition-all-200',
    leaveActiveClass: 'transition-all-200',
    enterFromClass: 'opacity-0 translate-y-4',
    leaveToClass: 'opacity-0 translate-y-4',
  },
}
</script>

<template>
  <Suspense>
    <div class="bg-nord1 min-h-screen text-white flex flex-col items-center justify-center p-8 overflow-x-hidden max-w-screen">
      <section class="lg:container space-y-4 px-8 ">
        
        <div class="grid grid-cols-1 gap-8">
          <form class="grid grid-cols-1 gap-8 border-2 border-nord3 rounded-lg p-8" @submit.prevent>

            <h3 class="text-3xl font-bold">The input.</h3>

            <p class="text-base">
              The input component is a wrapper to the native HTML input element with
              no custom styling but a shitload of additional functionality.
            </p>

            <Icon icon="carbon:volume-up" :options="{ width: 80 }"/>

              <Editor
                class="h-84 w-full bg-#282c34 children:h-full rounded-lg overflow-x-hidden overflow-y-auto"
                v-model="value"
              />

              <Markdown
                class="h-84 w-full bg-#282c34 p-8 rounded-lg overflow-x-hidden overflow-y-auto"
                :content="value"
                :options="{
                  breaks: true
                }"
              />

            {{ value }}

            <Input
              label="Email"
              message="Please enter your email"
              v-bind="inputBaseProps"
              v-model="value"
              :rules="isCommenter"
              validate-on="input"
              item-text="email"
              item-value="email"
              type="list"
              :items="allComments"
            />

            <Input
              label="Email"
              message="Please enter your email"
              v-bind="inputBaseProps"
              v-model="value"
              :rules="[isCommenter]"
              validate-on="input"
              :items="allComments"
            />

            <Input
              label="Email"
              message="Provide valid email address"
              autocomplete="family-name"
              icon-prepend="carbon:email"
              icon-append="carbon:4k"
              multiple
              :icon-options="{ width: 20 }"
              type="listbox"
              item-text="email"
              item-value="email"
              v-model="value"
              searchable
              placeholder="Search a comment..."
              :items="allComments"
              :rules="[isCommenter]"
              validate-on="input"
              v-bind="inputBaseProps"
            >
            </Input>

            <!-- Neomorphic button using nord colors -->
            <Button
              type="submit"
              label="Submit"
              icon="carbon:3d-cursor"
              icon-append="carbon:chevron-right"
              :icon-options="{ width: 20 }"
              class="flex items-center children:not-first:ml-2 justify-center mt-4 bg-nord2 hover:bg-nord3 p-4 rounded-lg loading:bg-nord4"
            />
          </form>

        </div>
      </section>
    </div>
  </Suspense>
</template>
