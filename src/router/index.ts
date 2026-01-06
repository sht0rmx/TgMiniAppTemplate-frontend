import { createRouter, createWebHistory } from 'vue-router'
import { type RouteRecordRaw } from 'vue-router'
import { i18n } from '@/locales/index.js'

import HomeView from '@/views/Home.vue'
import LoginView from '@/views/Login.vue'

import { isTgEnv, WebApp, authRequired, backButton, hiddenNav } from '@/main.js'
import ErrorPage from '@/views/NotFound.vue'
import MenuView from '@/views/Menu.vue'
import Settings from '@/views/Settings.vue'
import Devices from '@/views/Devices.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { titleKey: 'views.home.header', auth: false, noTopSafeArea: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { titleKey: 'views.auth.header', auth: false, noNav: true },
  },
  {
    path: '/menu',
    name: 'Menu',
    component: MenuView,
    meta: { titleKey: 'views.menu.header', auth: false },
  },
  {
    path: '/menu/settings',
    name: 'Settings',
    component: Settings,
    meta: { titleKey: 'views.settings.header', auth: false },
  },
  {
    path: '/menu/settings/devices',
    name: 'Devices',
    component: Devices,
    meta: { titleKey: 'views.devices.header', auth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: ErrorPage,
    meta: { titleKey: 'views.not_found.header', auth: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.afterEach((to) => {
  if (to.path.split('/').length <= 2) {
    if (isTgEnv.value && WebApp) {
      WebApp.BackButton.hide()
      backButton.value = false
    }
  } else {
    if (isTgEnv.value && WebApp) {
      WebApp.BackButton.show()
      backButton.value = true
    }
  }
})

router.beforeEach((to, _, next) => {
  authRequired.value = to.meta.auth as boolean
  let hideNav: String | any = to.meta.noNav

  if (hideNav) {
    hiddenNav.value = hideNav
  } else {
    hiddenNav.value = false
  }
  return next()
})

export default router
