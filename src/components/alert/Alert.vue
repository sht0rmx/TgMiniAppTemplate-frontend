<script setup lang="ts">
import { alerts } from "./index"
</script>

<template>
  <div
  class="z-9999 fixed bottom-0 left-0 w-full flex flex-col justify-end p-5 space-y-3 pointer-events-none"
>
  <transition-group name="slide-up" tag="div">
    <div
      v-for="a in alerts"
      :key="a.id"
      class="alert mt-3 alert-soft pointer-events-auto"
      :class="a.type"
    >
      <i :class="a.icon" class="text-2xl"></i>
      <span>{{ $t(a.msg, a.subKey) }}</span>
    </div>
  </transition-group>
</div>

</template>
