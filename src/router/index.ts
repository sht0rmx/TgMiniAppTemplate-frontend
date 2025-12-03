import { createRouter, createWebHistory } from 'vue-router'
import { i18n } from '@/locales/index.js'

import HomeView from '@/views/Home.vue'
import LoginView from '@/views/Login.vue'

import { isTgEnv, WebApp, lockPage, backButton, authStstus, hiddenNav } from '@/main.js'
import ErrorPage from '@/components/ErrorPage.vue'
import MenuView from '@/views/Menu.vue'
import Settings from '@/views/Settings.vue'

const routes = [
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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: ErrorPage,
    props: {
      code: '404',
      desc: i18n.global.t('views.not_found.content'),
      hint: i18n.global.t('views.not_found.hint'),
    },
    meta: { titleKey: 'views.not_found.header', auth: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.afterEach((to) => {
  const key = to.meta.titleKey

  if (key) {
    document.title = i18n.global.t(key)
  }

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
  let requireAuth = to.meta.auth
  let hideNav: String | any = to.meta.noNav

  if (hideNav) {
    hiddenNav.value = hideNav
  } else {
    hiddenNav.value = false
  }

  if (requireAuth && authStstus && !to.path.includes('/login')) {
    lockPage.value = true
    return next()
  }
  lockPage.value = false
  return next()
})

export default router
