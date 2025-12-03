<script setup lang="ts">
import { backButton, isTgEnv } from '@/main'

defineProps({
  title: String,
})
</script>

<template>
  <div class="flex items-center justify-between w-full gap-3 mb-8 md:pt-3 md:pl-3">
    <div v-if:="backButton" class="hidden md:flex items-center">
      <button @click="$router.back()">
        <i class="ri-arrow-left-line text-2xl" />
      </button>
    </div>

    <h1 class="text-2xl font-semibold flex-1 text-center md:text-left md:text-4xl">
      {{ title }}
    </h1>

    <div v-if="!isTgEnv">
      <slot />
    </div>
  </div>
</template>
