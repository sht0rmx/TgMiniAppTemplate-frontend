<script setup lang="ts">
import { backButton, isTgEnv, WebApp } from '@/main';

defineProps({
    title: String,
})
</script>

<template>
    <div class="flex items-center justify-between w-full gap-3 mb-8 lg:pt-3 lg:pl-3">
        
        <div v-if="!isTgEnv" class="flex items-center">
            <button v-show="backButton" @click="$router.back()">
                <i class="ri-arrow-left-line text-2xl" />
            </button>
        </div>
        
        <h1 class="text-2xl font-semibold flex-1 sm:text-center lg:text-left lg:text-4xl">
            {{ title }}
        </h1>

        <div v-if="!isTgEnv">
            <slot />
        </div>
    </div>
</template>