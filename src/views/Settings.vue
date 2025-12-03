<script setup lang="ts">
import { AuthService } from '@/api/auth.api'
import Header from '@/components/Header.vue'

console.log(AuthService.check())
</script>

<template>
  <Header :title="$t('views.settings.title')" />
  <div class="flex flex-col gap-2">
    <ul class="mx-2">
      <li>
        <button class="w-full p-2 items-center">
          <i class="text-2xl"></i>
        </button>
      </li>
    </ul>
  </div>
</template>
