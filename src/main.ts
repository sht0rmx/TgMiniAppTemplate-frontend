import '@/assets/main.css'
import 'remixicon/fonts/remixicon.css'

import { createApp, ref, type Ref } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from './locales'
import { apiClient } from './api/api'
import { PingService } from './api/ping.api'
import { AuthService } from './api/auth.api'

export let isTgEnv: Ref<boolean> = ref(false)
export let WebApp: import('telegram-web-app').WebApp | null = null
export let isLoading: Ref<boolean> = ref(true)

export let authStstus: Ref<boolean> = ref(false)
export let lockPage: Ref<boolean> = ref(false)

export let hiddenNav: Ref<boolean> = ref(false)
export let backButton: Ref<boolean> = ref(false)

//Splash Screen statuses
export let technicalWork: boolean = import.meta.env.VITE_CONSTRUCTION_MODE as boolean
export let unableAccessApi: Ref<boolean> = ref(false)

export const nav_items = [
  { icon: 'ri-home-line', label: 'components.dock.home', to: '/' },
  { icon: 'ri-menu-line', label: 'components.dock.menu', to: '/menu' },
]

if (window?.Telegram?.WebApp) {
  WebApp = window.Telegram.WebApp
  const data = WebApp.initDataUnsafe
  const valid = data && data.hash && data.user?.id

  if (valid) {
    isTgEnv.value = true
    console.log('Telegram environment detected')

    const isDesktop = WebApp.platform === 'tdesktop'
    if (!isDesktop) {
      WebApp.disableVerticalSwipes()
      WebApp.requestFullscreen()
    }

    WebApp.BackButton.show()
    WebApp.BackButton.onClick(() => router.back())

    WebApp.SettingsButton.show()
    WebApp.SettingsButton.onClick(() => router.push('/menu/settings'))
  } else {
    isTgEnv.value = false
    console.warn('Telegram.WebApp exists, but initData is not valid (opened in browser)')
  }
} else {
  isTgEnv.value = false
  console.warn('Not inside Telegram, fallback mode')
}


async function authInit(): Promise<boolean> {
  await apiClient.setFingerprint()
  let res = await PingService.pingPong()
  if (!res) {
    unableAccessApi.value = true
    return false
  }

  let ac = await apiClient.getAccessToken()
  if (!ac) {
    router.push({
      path: '/login',
      query: {
        redirect: router.currentRoute.value.path,
      },
    })
    return false
  } else if (ac) {
    let status = await AuthService.check()
    if (!status) {
      return false
    }
    return true
  }
  return false
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')

authStstus.value = await authInit()

if (!technicalWork && !unableAccessApi.value) {
  isLoading.value = false
}
