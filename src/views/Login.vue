<script setup lang="ts">
import { apiClient } from '@/api/api';
import { AuthService } from '@/api/auth.api';
import QrCode from '@/components/QrCode.vue';
import { onMounted, ref, type Ref, onBeforeUnmount } from 'vue';

const qrUrl: Ref<string> = ref("")
let authPromise: Promise<unknown> | null = null
let sseCancel: (() => void) | null = null
let loginId: string = ""

let timer: number | null = null
const QR_LIFETIME = 5 * 60 * 1000   // 5 minutes

function stopQR() {
  qrUrl.value = ""
  if (sseCancel) sseCancel()
  sseCancel = null

  if (timer) clearTimeout(timer)
  timer = null
}

async function startQR() {
  stopQR()

  const resp = await AuthService.startQrLogin()

  loginId = resp.loginId
  qrUrl.value = resp.qrUrl
  authPromise = resp.authPromise
  sseCancel = resp.cancelSse

  timer = window.setTimeout(() => {
    console.log("QR expired → closing SSE")
    stopQR()
  }, QR_LIFETIME)

  authPromise
    ?.then(token => {
      console.log("Auth success:", token)
      stopQR()
    })
    .catch(err => {
      console.warn("Auth rejected:", err)
      stopQR()
    })
}

onMounted(() => startQR())
onBeforeUnmount(() => stopQR())
</script>

<template>
    <div class="flex flex-col min-h-full items-center justify-center px-4">
        <div class="card bg-base-100 w-90">
            <div class="card-body flex flex-col items-center text-center gap-3">
                <div class="flex flex-col items-center justify-center">
                    <i class="ri-user-line text-3xl" />
                    <h2 class="card-title text-2xl">{{ $t('views.auth.title') }}</h2>
                    <p class="opacity-70">{{ $t('views.auth.hint') }}</p>
                </div>
                <div v-if="!qrUrl" class="card w-50 h-50 bg-base-200/30">
                    <div class="card-body flex flex-col items-center justify-center h-full text-center">
                        <button class="btn btn-small btn-accent btn-soft flex flex-row items-center gap-1">
                            <i class="ri-reset-right-line text-base"></i>
                            <span class="text-base">{{ $t('views.auth.try_again') }}</span>
                        </button>
                    </div>
                </div>
                <QrCode v-else :url="qrUrl"></QrCode>

                <div class="flex flex-row gap-3">
                    <button class="btn btn-small btn-square">
                        <i class="ri-github-line text-2xl"></i>
                    </button>
                    <button class="btn btn-small btn-square">
                        <i class="ri-telegram-2-line text-2xl"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>