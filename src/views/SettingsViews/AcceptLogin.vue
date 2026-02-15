<script setup lang="ts">
import { AuthService } from '@/api/auth.api.ts'
import { showPush } from '@/components/alert'
import { authStstus } from '@/main.ts'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const codeInput = ref('')
const isLoading = ref(false)
const isFound = ref(false)
const isAccepted = ref(false)
const errorMsg = ref('')

// Decode loginid from query param (QR scan flow)
const loginIdFromQr = ref('')

onMounted(async () => {
  if (!authStstus.value) {
    showPush('views.accept_login.not_authorized', '', 'alert-warning', 'ri-error-warning-line')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  const encoded = route.query.loginid as string
  if (encoded) {
    try {
      loginIdFromQr.value = atob(encoded)
      await searchByLoginId()
    } catch {
      errorMsg.value = 'views.accept_login.invalid_qr'
    }
  }
})

async function searchByLoginId() {
  if (!loginIdFromQr.value) return
  isLoading.value = true
  errorMsg.value = ''

  try {
    const found = await AuthService.checkLogin(loginIdFromQr.value)
    isFound.value = found
    if (!found) {
      errorMsg.value = 'views.accept_login.not_found'
    }
  } catch {
    errorMsg.value = 'views.accept_login.not_found'
  } finally {
    isLoading.value = false
  }
}

async function searchByCode() {
  if (!codeInput.value.trim()) return
  isLoading.value = true
  errorMsg.value = ''
  isFound.value = false

  try {
    const found = await AuthService.searchByCode(codeInput.value.trim().toLowerCase())
    isFound.value = found
    if (!found) {
      errorMsg.value = 'views.accept_login.not_found'
    }
  } catch {
    errorMsg.value = 'views.accept_login.not_found'
  } finally {
    isLoading.value = false
  }
}

async function acceptLogin() {
  isLoading.value = true
  errorMsg.value = ''

  try {
    let success = false

    if (loginIdFromQr.value) {
      success = await AuthService.validateLogin(loginIdFromQr.value)
    } else if (codeInput.value.trim()) {
      success = await AuthService.acceptByCode(codeInput.value.trim().toLowerCase())
    }

    if (success) {
      isAccepted.value = true
      showPush('views.accept_login.accepted', '', 'alert-success', 'ri-check-line')
    } else {
      errorMsg.value = 'views.accept_login.accept_failed'
    }
  } catch {
    errorMsg.value = 'views.accept_login.accept_failed'
  } finally {
    isLoading.value = false
  }
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col min-h-full items-center justify-center px-4">
    <div class="card bg-base-100 lg:w-100 w-full max-w-md">
      <div class="card-body flex flex-col items-center text-center gap-4">
        <!-- Header -->
        <div class="flex flex-col items-center justify-center">
          <i class="ri-shield-check-line text-3xl" />
          <h2 class="card-title text-2xl">{{ $t('views.accept_login.title') }}</h2>
          <p class="opacity-70 text-sm">{{ $t('views.accept_login.hint') }}</p>
        </div>

        <!-- Success state -->
        <div v-if="isAccepted" class="flex flex-col items-center gap-3 py-4">
          <div class="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
            <i class="ri-check-line text-4xl text-success"></i>
          </div>
          <p class="text-lg font-semibold">{{ $t('views.accept_login.success') }}</p>
          <button class="btn btn-primary btn-wide" @click="goHome">
            {{ $t('views.accept_login.close') }}
          </button>
        </div>

        <!-- Login form -->
        <template v-else>
          <!-- QR auto-detected -->
          <div v-if="loginIdFromQr" class="w-full">
            <div
              v-if="isFound"
              class="flex flex-col items-center gap-3 p-4 bg-base-200/50 rounded-xl"
            >
              <i class="ri-qr-code-line text-4xl text-accent"></i>
              <p class="text-sm opacity-70">{{ $t('views.accept_login.qr_detected') }}</p>
            </div>
          </div>

          <!-- Manual code entry -->
          <div v-if="!loginIdFromQr" class="w-full flex flex-col gap-3">
            <label class="input input-bordered w-full flex items-center gap-2">
              <i class="ri-key-2-line opacity-50"></i>
              <input
                v-model="codeInput"
                type="text"
                class="grow font-mono tracking-wider lowercase"
                :placeholder="$t('views.accept_login.code_placeholder')"
                maxlength="8"
                @keyup.enter="searchByCode"
              />
            </label>
            <button
              class="btn btn-accent btn-soft w-full"
              :disabled="!codeInput.trim() || isLoading"
              @click="searchByCode"
            >
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              <i v-else class="ri-search-line"></i>
              {{ $t('views.accept_login.search') }}
            </button>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="alert alert-warning text-sm">
            <i class="ri-error-warning-line"></i>
            <span>{{ $t(errorMsg) }}</span>
          </div>

          <!-- Accept button -->
          <div v-if="isFound" class="w-full flex flex-col gap-2">
            <div class="divider text-xs opacity-50">{{ $t('views.accept_login.confirm_label') }}</div>
            <button
              class="btn btn-primary btn-wide w-full"
              :disabled="isLoading"
              @click="acceptLogin"
            >
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              <i v-else class="ri-check-line"></i>
              {{ $t('views.accept_login.accept') }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
