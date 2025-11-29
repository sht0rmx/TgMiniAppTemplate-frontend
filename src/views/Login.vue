<script setup lang="ts">
import { apiClient } from '@/api/api';
import { AuthService } from '@/api/auth.api';
import { showPush } from '@/components/alert';
import QrCode from '@/components/QrCode.vue';
import { isTgEnv, WebApp } from '@/main';
import { onMounted, ref, type Ref, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const qrUrl: Ref<string> = ref("")
const qrStarted: Ref<boolean> = ref(false)
let authPromise: Promise<unknown> | null = null
let sseCancel: (() => void) | null = null
let loginId: string = ""

const redirect_to: string | any = route.query.redirect
const auth_method: string | any = route.query.auth_method

let timer: number | null = null
const QR_LIFETIME = 5 * 60 * 1000

function stopQR() {
  qrUrl.value = ""
  if (sseCancel) sseCancel()
  sseCancel = null

  if (timer) clearTimeout(timer)
  timer = null
}

async function LoginTg() {
    if (WebApp && isTgEnv) {
        console.log(WebApp.initData)
        let initdata = WebApp.initData
        let res = await AuthService.webappLogin({"initData": initdata})
        console.log(res, apiClient.getAccessToken())
        if (!res) {
            return false
        } 
        return true
    }
    return false
}


async function startQR(): Promise<boolean> {
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
      return true
    })
    .catch(err => {
      console.warn("Auth rejected:", err)
      stopQR()
      return false
    })

    return false
}

async function  startLogin() {
    let res = false

    try {
        res = await apiClient.refreshTokens()
    } catch {
        null
    }

    if (res) {
        showPush("views.auth.login_success", "", "alert-success", "ri-check-line")
        router.push(redirect_to)
    }

    else if (auth_method && auth_method === "Telegram") {
        let status = await LoginTg()
        if (status) {
            showPush("views.auth.login_success", "", "alert-success", "ri-check-line")
            router.push(redirect_to)
        } else {
            showPush("views.auth.miniapp_error", "", "alert-warning", "ri-error-warning-line")
        }
    }
    else {
        let result = await startQR()
        if (result) {
            showPush("views.auth.login_success", "", "alert-success", "ri-check-line")
            router.push(redirect_to)
        } else {
            showPush("views.auth.login_rejected", "", "alert-warning", "ri-error-warning-line")
        }
    }
}

onMounted(() => startLogin())
onBeforeUnmount(() => stopQR())
</script>

<template>
    <div class="flex flex-col min-h-full items-center justify-center px-4">
        <div class="card bg-base-100 lg:w-90">
            <div class="card-body flex flex-col items-center text-center gap-3">
                <div class="flex flex-col items-center justify-center">
                    <i class="ri-user-line text-3xl" />
                    <h2 class="card-title text-2xl">{{ $t('views.auth.title') }}</h2>
                    <p class="opacity-70">{{ $t('views.auth.hint') }}</p>
                </div>
                <div v-if="!qrUrl" class="card w-50 h-50 bg-base-200/30">
                    <div class="card-body flex flex-col items-center justify-center h-full text-center">
                        <button v-if="!isTgEnv && qrStarted" class="btn btn-small btn-accent btn-soft flex flex-row items-center gap-1">
                            <i class="ri-reset-right-line text-base"></i>
                            <span class="text-base">{{ $t('views.auth.try_again') }}</span>
                        </button>
                        <div v-else-if="auth_method === 'Telegram'" class="flex flex-col justify-center items-center">
                            <span class="loading loading-spinner loading-xl text-primary"></span>
                            <span class="opacity-70">{{ $t("views.auth.initdata") }}</span>
                        </div>
                        <div v-else class="flex justify-center items-center">
                             <span class="loading loading-spinner loading-xl text-primary"></span>
                        </div>
                    </div>
                </div>
                <QrCode v-else :url="qrUrl"></QrCode>

                <div class="flex flex-row gap-3">
                    <button class="btn btn-small btn-square">
                        <i as="a" class="ri-github-line text-2xl" href="https://t.me/sniplabot"></i>
                    </button>
                    <button class="btn btn-small btn-square">
                        <i class="ri-telegram-2-line text-2xl"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>