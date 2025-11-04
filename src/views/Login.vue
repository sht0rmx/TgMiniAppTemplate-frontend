<script setup lang="js">
import { ref, onMounted, onUnmounted } from "vue"
import QrCode from '@/components/QrCode.vue'
import { apiClient } from '@/api/client'

const botName = import.meta.env.VITE_BOTNAME
const maxTime = 5 * 60

const loginId = ref("none")
const qrUrl = ref("")
const timerDisplay = ref("5:00")
let startTime = 0
let timer = null

async function startLogin() {
  try {
    const { loginId: id, qrUrl: url } = await apiClient.startQrLogin()
    loginId.value = id
    qrUrl.value = url
    startTime = Date.now()
    startTimer()
  } catch (err) {
    console.error("Error while generating QR:", err)
    qrUrl.value = ""
  }
}

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
      startLogin()
      return
    }
    timerDisplay.value = formatTime(remain)
  }, 1000)
}


onMounted(() => {
  startLogin()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center gap-3 text-cbase w-md">
    <i class="ri-key-line text-8xl text-accent"></i>
    <h1 class="text-3xl font-bold">{{ $t('views.login.title') }}</h1>

    <QrCode v-if="qrUrl" :url="qrUrl" />

    <p class="text-hint text-sm max-w-xs text-center my-1">
      {{ $t('views.login.hint', { botname: botName }) }} {{ timerDisplay }}
    </p>
  </div>
</template>
