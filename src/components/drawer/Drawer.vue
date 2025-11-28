<script setup lang="ts">
import { hiddenNav } from '@/main'
import DrawerMenu from '@/components/drawer/DrawerMenu.vue'
</script>

<template>
  <div class="drawer" :class="{ 'lg:drawer-open': !hiddenNav }">
    <input id="sidebar" type="checkbox" class="drawer-toggle" />

    <div class="drawer-content">
      <slot />
    </div>

    <div class="drawer-side overflow-visible">
      <label for="sidebar" class="drawer-overlay"></label>
      <DrawerMenu />
    </div>
  </div>
</template>
