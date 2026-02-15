import '@/assets/main.css'
import 'remixicon/fonts/remixicon.css'

if (import.meta.env.DEV) {
  import('eruda').then((eruda) => eruda.default.init())
}

import { compile, computed, createApp, ref, type Ref } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from './locales'
import { apiClient } from './api/api'
import { PingService } from './api/ping.api'
import { AuthService } from './api/auth.api'
import { showPush } from './components/alert'

export let isTgEnv: Ref<boolean> = ref(false)
export let WebApp: import('telegram-web-app').WebApp | null = null
export let isLoading: Ref<boolean> = ref(true)

export let authStstus: Ref<boolean> = ref(false)
export let authRequired: Ref<boolean> = ref(false)
export let lockPage = computed(
  () => authRequired.value && !authStstus.value && router.currentRoute.value.fullPath !== '/login',
)

export let hiddenNav: Ref<boolean> = ref(false)
export let backButton: Ref<boolean> = ref(false)

export type Theme = 'system' | 'default' | 'dim' | 'nord'

export const currentTheme: Ref<Theme> = ref('system')
const THEME_KEY = 'theme'

//Splash Screen statuses
export let technicalWork: boolean = import.meta.env.VITE_CONSTRUCTION_MODE as boolean
export let unableAccessApi: Ref<boolean> = ref(false)

export const applyTheme = (theme: Theme) => {
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dim'
        : 'default'
      : theme

  document.documentElement.setAttribute('data-theme', resolved)
}

export const setTheme = (theme: Theme) => {
  currentTheme.value = theme
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
}

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
  let res = await PingService.pingPong()
  if (!res) {
    unableAccessApi.value = true
    return false
  }

  // Try to use existing in-memory token or refresh from cookie
  let ac = apiClient.getAccessToken()
  if (!ac) {
    try {
      const refreshed = await apiClient.refreshTokens()
      if (refreshed) {
        ac = apiClient.getAccessToken()
      }
    } catch {
      // refresh failed, no valid session
    }
  }

  if (ac) {
    const status = await AuthService.check()
    if (status) {
      return true
    }
    return false
  }

  // No token — redirect to login
  if (router.currentRoute.value.path === '/' || isTgEnv.value) {
    router.push({
      path: '/login',
      query: {
        redirect: router.currentRoute.value.path,
      },
    })
  } else {
    showPush('views.auth.without_login', '', 'alert-warning', 'ri-error-warning-line')
  }

  return false
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')

const saved = (localStorage.getItem(THEME_KEY) as Theme) || 'system'
setTheme(saved)

authStstus.value = await authInit()

if (!technicalWork && !unableAccessApi.value) {
  isLoading.value = false
}
