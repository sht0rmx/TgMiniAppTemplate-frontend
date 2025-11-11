<script setup lang="js">
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter } from 'vue-router'
import QrCode from '@/components/QrCode.vue'
import { apiClient } from '@/api/client'
import Button from "@/components/ui/button/Button.vue"

const router = useRouter()
const botName = import.meta.env.VITE_BOTNAME
const maxTime = 5 * 60

const loginId = ref("none")
const qrUrl = ref("")
const timerDisplay = ref(formatTime(maxTime))
const statusMessage = ref("Initializing...")
let timer = null
let cancelSse = null


function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString()
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function startTimer() {
  if (timer) clearInterval(timer)
  let remain = maxTime
  timerDisplay.value = formatTime(remain)

  timer = setInterval(() => {
    remain -= 1
    if (remain <= 0) {
      clearInterval(timer)
      timer = null
      console.log("QR Code timed out. Restarting login process.")
      startLogin()
      return
    }
    timerDisplay.value = formatTime(remain)
  }, 1000)
}

async function startLogin() {
  if (timer) clearInterval(timer)
  if (cancelSse) cancelSse()

  qrUrl.value = ""
  statusMessage.value = "Generating QR code and waiting for server ID..."
  loginId.value = "none"

  try {
    console.log("generating qr")
    const result = await apiClient.startQrLogin()

    loginId.value = result.loginId
    qrUrl.value = result.qrUrl
    cancelSse = result.cancelSse
    statusMessage.value = "Scan the QR code to log in. Waiting for approval..."

    startTimer()

    result.authPromise.then(async accessToken => {
      if (!accessToken) return
      console.log("Approved, got token:", accessToken)

      clearInterval(timer)
      apiClient.setAccessToken(accessToken)
      statusMessage.value = "✅ Approved! Redirecting..."
      setTimeout(() => router.push('/'), 1000)
    }).catch(err => {
      console.error("Error waiting for approval:", err)
      statusMessage.value = "Authorization failed. Retrying..."
      setTimeout(startLogin, 5000)
    })

    // clearInterval(timer) 
    // apiClient.setAccessToken(accessToken)
    // statusMessage.value = "Login successful! Redirecting..."

    // await router.push('/') 

  } catch (err) {
    console.error("Error during QR login flow:", err)
    clearInterval(timer)

    statusMessage.value = `Login failed: ${err.message || 'Unknown error'}. Retrying in 5 seconds...`
    qrUrl.value = ""

    setTimeout(startLogin, 5000)
  }
}

onMounted(() => {
  startLogin()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (cancelSse) {
    cancelSse()
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center gap-3 text-cbase w-md p-4">
    <i class="ri-key-line text-8xl text-accent"></i>
    <h1 class="text-3xl font-bold">{{ $t('views.login.title') }}</h1>

    <div class="w-64 h-64 flex items-center justify-center bg-card-secondary rounded-lg shadow-md">
      <QrCode v-if="qrUrl" :url="qrUrl" />
      <p v-else class="text-gray-500 p-4">{{ statusMessage }}</p>
    </div>

    <p class="text-hint text-sm max-w-xs text-center my-1">
      {{ $t('views.login.hint', { botname: botName }) }}
      <span v-if="qrUrl" class="font-bold text-accent">({{ timerDisplay }})</span>
      <span v-else class="text-sm text-gray-400">{{ statusMessage }}</span>
    </p>

    <Button v-if="!qrUrl" @click="startLogin" class="mt-2">
      Try Again
    </Button>
  </div>
</template>