<script setup lang="ts">
import { backButton, isTgEnv } from '@/main'

defineProps({
  title: String,
})
</script>

<template>
  <div
    class="fixed flex w-full top-0 left-0 z-50 header-box bg-base-300/60 backdrop-blur-md transition-all"
  >
    <div class="items-center justify-between w-full gap-3 px-4 py-2 md:pt-6 md:pl-6">
      <div v-if="backButton" class="hidden md:flex items-center">
        <button @click="$router.back()" class="hover:opacity-70">
          <i class="ri-arrow-left-line text-2xl" />
        </button>
      </div>

      <slot name="content">
        <h1 class="text-2xl font-semibold flex-1 text-center md:text-left md:text-4xl">
          {{ title }}
        </h1>
      </slot>

      <div v-if="!isTgEnv">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-box {
  padding-top: calc(var(--tg-safe-area-inset-top, 0px));
  overflow-x: clip;
}
</style>
