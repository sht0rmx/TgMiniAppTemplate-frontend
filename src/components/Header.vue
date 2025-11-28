<script setup lang="ts">
import { backButton, isTgEnv } from '@/main';

defineProps({
    title: String,
})
</script>

<template>
    <div class="flex items-center justify-between w-full gap-3 mb-8">
        
        <div v-if="!isTgEnv" class="flex items-center">
            <button v-show="backButton" @click="$router.back()">
                <i class="ri-arrow-left-line text-2xl" />
            </button>
        </div>
        
        <h1 class="text-2xl font-semibold flex-1" :class="{ 'text-center': isTgEnv }">
            {{ title }}
        </h1>

        <div v-if="!isTgEnv">
            <slot />
        </div>
    </div>
</template>