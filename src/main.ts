import "@/assets/main.css"
import 'remixicon/fonts/remixicon.css'

import { createApp, ref, type Ref } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from './locales'
import { apiClient } from "./api/api"

export let isTgEnv: Ref<boolean> = ref(false)
export let WebApp: import('telegram-web-app').WebApp | null = null
export let isLoading: Ref<boolean> = ref(true)

export let authStstus: Ref<boolean> = ref(false)
export let lockPage: Ref<boolean> = ref(false)

export const hiddenRoutes: string[] = ['Login']
export let hiddenNav: Ref<boolean> = ref(false)
export let backButton: Ref<boolean> = ref(false)

export const nav_items = [
  { icon: 'ri-home-line', label: "components.dock.home", to: '/' },
  { icon: 'ri-menu-line', label: "components.dock.menu", to: '/menu' },
]

if (window?.Telegram?.WebApp) {
  WebApp = window.Telegram.WebApp
  const initDataRaw = WebApp.initData || ''

  if (initDataRaw.length > 0) {
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
    WebApp.SettingsButton.onClick(() => router.push("/menu/settings"))
  } else {
    isTgEnv.value = false
    console.warn('Telegram.WebApp found, but no initData (probably opened in browser)')
  }
} else {
  isTgEnv.value = false
  console.warn('Not inside Telegram, fallback mode')
}

async function authInit(): Promise<boolean> {
  await apiClient.setFingerprint()
  return false
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')

authStstus.value = await authInit()

if (!authStstus) {
  router.push('/login')
}

isLoading.value = false