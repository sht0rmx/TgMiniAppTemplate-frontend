<script setup lang="ts">
import { computed, watch } from 'vue'
import BottomDock from '@/components/BottomDock.vue'
import AuthModal from '@/components/AuthModal.vue'
import SplashScreen from '@/components/SplashScreen.vue'
import { hiddenNav, isLoading, isTgEnv, lockPage, technicalWork, unableAccessApi } from '@/main.ts'
import Drawer from './components/drawer/Drawer.vue'
import { showPush } from './components/alert/index.ts'
import Alert from './components/alert/Alert.vue'

const containerClasses = computed(() => [
  'flex flex-col min-h-screen bg-base-200 overflow-hidden',
  { 'blur-sm': lockPage.value },
  { 'pb-20': !hiddenNav.value },
])

const mainClasses = computed(() => [
  'flex-1 flex overflow-y-auto',
  isTgEnv.value ? 'px-4 pt-2' : 'px-10 pt-4',
])

watch(unableAccessApi, () => {
  if (!technicalWork && unableAccessApi.value) {
    showPush('splash.api_unavalible', '', 'alert-warning', 'ri-error-warning-line', false)
  }
})

if (technicalWork) {
  showPush('splash.construction', '', 'alert-info', 'ri-server-line', false)
}
</script>

<template>
  <Drawer>
    <SplashScreen v-show="isLoading" />

    <div :class="containerClasses" class="app-container lg:pb-4">
      <main :class="mainClasses">
        <div class="w-full">
          <router-view />
        </div>
      </main>

      <BottomDock v-if="!hiddenNav" />
    </div>

    <AuthModal />
    <Alert />
  </Drawer>
</template>

<style scoped>
.app-container {
  padding-top: calc(var(--tg-safe-area-inset-top, 0px));
  overflow-x: clip;
}
</style>
