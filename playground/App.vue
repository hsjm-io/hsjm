<script setup lang="ts">
const enabled = ref(false)
</script>

<template>
<div class="bg-nord1 min-h-screen text-white flex flex-col items-center justify-center">
  <section class="lg:container space-y-4 overflow-visible px-8">


    <div class="grid grid-cols-2">
      <div class="border-2 border-nord3 rounded-lg p-8 space-y-4">
        <h3 class="text-3xl font-bold">The switch.</h3>
        <p class="text-base">
          Switches are a pleasant interface for toggling a value between two states,
          and offer the same semantics and keyboard navigation as native checkbox elements.
        </p>
        <ShinySwitch v-model="enabled" value="foo" class="w-16">Foobar</ShinySwitch>
        <ShinySwitch v-model="enabled" value="bar" class="w-16">Barfoo</ShinySwitch>
      </div>
    </div>


  </section>
</div>
</template>
