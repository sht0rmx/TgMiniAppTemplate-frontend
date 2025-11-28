<script setup lang="ts">
import Header from '@/components/Header.vue'
</script>

<template>
  <div class="flex flex-col min-h-full">
    <Header :title="$t('views.menu.title')" :settings_show="true">
      <button @click="$router.push('/menu/settings')"
        class="tooltip tooltip-left"
        :data-tip="$t('views.menu.settings_tooltip')">
        <i class="ri-settings-3-line text-2xl" />
      </button>
    </Header>

    <div class="flex-1 flex items-center justify-center px-4">
      <div class="card card-dash bg-base-100 w-96 max-w-full">
        <div class="card-body flex flex-col items-center text-center">
          <i class="ri-archive-line text-3xl"/>
          <h2 class="card-title">{{ $t('views.menu.empty.title') }}</h2>
          <p class="opacity-70">{{ $t('views.menu.empty.hint') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
