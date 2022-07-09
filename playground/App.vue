<script setup lang="ts">
import { Input, Button } from '@hsjm/core'
import { toKebabCase, toCapitalized } from '@hsjm/shared'
const value = ref('Eliseo@gardner.biz')
const isCommenter = async(value: string) => {
  const result = await fetch(`https://jsonplaceholder.typicode.com/comments?email=${value}`)
  const data = await result.json()
  console.count('FETCH')
  return data.length > 0
}
</script>

<template>
  <div class="bg-nord1 min-h-screen text-white flex flex-col items-center justify-center p-8">
    <section class="lg:container space-y-4 overflow-visible px-8">
      
      <div class="grid grid-cols-2 gap-8">
        <!-- Input -->
        <form class="border-2 border-nord3 rounded-lg p-8">
          <h3 class="text-3xl font-bold">The input.</h3>
          <p class="text-base mt-4">
            The input component is a wrapper to the native HTML input element with
            no custom styling but a shitload of additional functionality.
          </p>

          <Input
            label="Email"
            message="Provide valid email address"
            autocomplete="family-name"
            v-model="value"
            optional
            icon="carbon:email"
            type="email"
            :rules="[/a/g, 'A']"
            :icon-options="{ width: 20 }"
            validate-on="input"
            validate-debounce="0"
            class="flex flex-col mt-4"
            class-label="font-bold"
            class-group="flex items-center bg-nord2 w-full h-12 space-x-4 rounded-lg mt-2 px-4 py-4 group"
            class-input="bg-transparent w-full outline-none mx-4 loading:bg-nord3"  
            class-message="text-xs text-nord4 mt-2 px-2"
            class-error="text-xs text-red-300 mt-2 px-2"
          >
          </Input>

          <!-- Neomorphic button using nord colors -->
          <Button
            type="submit"
            label="Submit"
            class="flex items-center justify-center mt-4 bg-nord2 hover:bg-nord3 p-4 rounded-lg"
          />
        </form>

      </div>
    </section>
  </div>
</template>
