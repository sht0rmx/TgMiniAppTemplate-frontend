<script setup lang="ts">
import Header from '@/components/Header.vue';
</script>

<template>
    <Header :title="$t('views.settings.title')"/>
    <div class="flex flex-col gap-2">
        <ul class="mx-2">
            <li>
                <button class="w-full p-2 items-center">
                    <i class="text-2xl"></i>
                    <span class="{ 'opacity-70': $route.path !== i.to }">aaa</span>
                </button>
            </li>
        </ul>
    </div>
</template>