<script setup lang="ts">
import { authStstus } from '@/main'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
import { watch } from 'vue'

watch(
  () => userStore.data,
  (newData) => {
    if (newData) {
      console.log('Data is now available:', newData)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="card bg-base-100 border border-base-300 shadow-sm">
    <div class="card-body gap-4">
      <div v-if="!authStstus" class="flex flex-col items-center text-center gap-4">
        <i class="ri-account-circle-2-line text-7xl text-accent/80" />

        <div class="space-y-1">
          <p class="text-lg font-semibold">
            {{ $t('components.sidebar.auth.title') }}
          </p>
          <p class="text-sm text-base-content/60">Sign in to access your account</p>
        </div>

        <button
          class="btn btn-primary w-full"
          @click="
            $router.push({
              path: '/login',
              query: { redirect: $router.currentRoute.value.path },
            })
          "
        >
          <i class="ri-login-box-line" />
          <span>Enter or register</span>
        </button>
      </div>
      <ClientOnly v-show="authStstus">
        <div v-if="userStore.data" class="flex items-center gap-4">
          <div class="avatar">
            <div class="w-12 rounded-full bg-neutral text-neutral-content">
              <img
                v-if="userStore.data.avatar_url"
                :src="userStore.data.avatar_url"
                :alt="userStore.data.name"
                @error="userStore.data.avatar_url = null"
              />
              <span v-else class="text-xl font-semibold uppercase">
                {{ userStore.data.name?.charAt(0) || 'U' }}
              </span>
            </div>
          </div>

          <div class="flex flex-col leading-tight">
            <span class="text-lg font-semibold">
              {{ userStore.data.name }}
            </span>
            <span class="text-sm text-base-content/60"> Authorized user </span>
          </div>
        </div>

        <div v-else-if="authStstus" class="flex items-center gap-3 text-base-content/60">
          <span class="loading loading-spinner loading-sm"></span>
          <span>Loading profile…</span>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>
