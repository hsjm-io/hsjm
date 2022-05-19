<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
<div class="bg-nord4 dark:bg-nord1 h-screen dark:text-white flex p-24">

  <section class="container mx-auto my-auto space-y-4 text-center">
    <h1 class="text-4xl">Playground</h1>
    <ClientOnly>
      <button class="btn btn-nord-1 dark:btn-nord14 text-white" @click="toggleDark()">
        Switch to {{ isDark ? 'Light' : 'Dark '}}
      </button>
    </ClientOnly>
  </section>
</div>
</template>
