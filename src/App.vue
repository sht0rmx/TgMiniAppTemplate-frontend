<script setup lang="ts">
import { computed } from 'vue'
import BottomDock from './components/BottomDock.vue'
import AuthModal from './components/AuthModal.vue'
import SplashScreen from './components/SplashScreen.vue'
import { useRoute } from 'vue-router'
import { hiddenNav, hiddenRoutes, isLoading, isTgEnv, lockPage } from '@/main.ts' 
import Drawer from './components/drawer/Drawer.vue'

const route = useRoute()

const isDockHidden = computed(() => {
  const name = route.name?.toString() || ''
  return hiddenRoutes.includes(name)
})

hiddenNav.value = isDockHidden.value

const containerClasses = computed(() => [
  'flex flex-col min-h-screen bg-base-200 overflow-hidden',
  { 'blur-sm': lockPage.value },
  { 'pb-20': !hiddenNav.value },
])

const mainClasses = computed(() => [
  'flex-1 flex overflow-y-auto',
  isTgEnv.value ? 'px-4 pt-2' : 'px-10 pt-4',
])
</script>

<template>
  <Drawer>
    <SplashScreen v-if="isLoading" />

    <div v-else :class="containerClasses" class="app-container lg:pb-4">

      <main :class="mainClasses">
        <div class="w-full">
          <router-view />
        </div>
      </main>

      <BottomDock v-if="!hiddenNav" />
    </div>

    <AuthModal/>
  </Drawer>
</template>

<style scoped>
.app-container {
  padding-top: calc(var(--tg-safe-area-inset-top, 0px));
  overflow-x: clip;
}
</style>
