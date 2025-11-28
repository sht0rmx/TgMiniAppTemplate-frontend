<script setup lang="js">
defineProps({
  code: String,
  desc: String,
  hint: String,
})
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="flex flex-col items-center justify-center text-center gap-3">
      <h1 class="text-7xl font-bold text-error">{{ code }}</h1>
      <div class="mb-3">
          <p class="text-xl">{{ desc }}</p>
          <p class="text-sm opacity-70">{{ hint }}</p>
      </div>
      <button class="btn btn-soft btn-primary" @click="$router.push('/')">
        <i class="ri-arrow-left-line"/>
        {{ $t('views.not_found.back_button') }}
      </button>
    </div>
  </div>
</template>
