<script setup lang="ts">
import { ref, watch } from 'vue'
import { AuthService } from '@/api/auth.api'
import Header from '@/components/Header.vue'
import LoginCard from '@/components/LoginCard.vue'
import Menu from '@/components/menu/Menu.vue'
import MenuButton from '@/components/menu/Button.vue'
import MenuContent from '@/components/menu/Content.vue'
import MenuDropdown from '@/components/menu/Dropdown.vue'
import { useI18n } from 'vue-i18n'
import { supported } from '@/locales'
import { authStstus, isTgEnv, currentTheme, setTheme, type Theme } from '@/main'

const { locale, t, d } = useI18n()
const localeValue = ref(locale.value)

const appVersion = __APP_VERSION__
const buildHash = __BUILD_HASH__
const buildDate = new Date(__BUILD_DATE__).toLocaleDateString(locale.value, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const themes: { id: Theme; label: string; icon: string }[] = [
  { id: 'system', label: t('app.ui.system'), icon: 'ri-computer-line' },
  { id: 'dim', label: t('app.ui.dark'), icon: 'ri-moon-line' },
  { id: 'nord', label: t('app.ui.light'), icon: 'ri-sun-line' },
]

watch(localeValue, (val) => {
  if (val !== locale.value) {
    locale.value = val
    document.cookie = `lang=${val};path=/;max-age=31536000`
  }
})

const selectLang = (lang: string) => {
  localeValue.value = lang
  const popover = document.getElementById('lang-popover')
  if (popover) (popover as any).hidePopover()
}

const logout = async () => {
  try {
    await AuthService.revokeRefreshSession()
    window.location.reload()
  } catch (error) {
    console.error('Logout failed', error)
  }
}
</script>

<template>
  <Header :title="t('views.settings.title')" />

  <div class="flex flex-col gap-6 px-0">
    <LoginCard />

    <Menu>
      <MenuDropdown>
        <MenuButton
          tabindex="0"
          role="button"
          :text="$t('views.settings.appearance')"
          icon="ri-moon-clear-line"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-accent uppercase font-semibold">
              {{ themes.find((theme) => theme.id === currentTheme)?.label }}
            </span>
          </div>
        </MenuButton>
        <MenuContent>
          <li class="flex flex-col gap-1">
            <button
              v-for="theme in themes"
              :key="theme.id"
              @click="setTheme(theme.id)"
              class="flex justify-between items-center py-2 px-4 rounded-lg"
              :class="
                currentTheme === theme.id ? 'bg-accent text-accent-content' : 'hover:bg-base-200'
              "
            >
              <div class="flex items-center gap-2">
                <i :class="theme.icon" />
                <span class="font-medium">{{ theme.label }}</span>
              </div>

              <i v-if="currentTheme === theme.id" class="ri-check-line" />
            </button>
          </li>
        </MenuContent>
      </MenuDropdown>

      <MenuDropdown>
        <MenuButton
          tabindex="0"
          role="button"
          :text="$t('views.settings.language')"
          icon="ri-translate"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-accent uppercase font-semibold">
              {{ localeValue }}
            </span>
          </div>
        </MenuButton>

        <MenuContent>
          <li class="flex flex-col gap-1">
            <button
              v-for="lang in supported"
              :key="lang"
              @click="selectLang(lang)"
              class="flex justify-between items-center py-2 px-4 rounded-lg"
              :class="lang === localeValue ? 'bg-accent text-accent-content' : 'hover:bg-base-200'"
            >
              <span class="font-medium">
                {{ t(`lang_select.${lang}`) }}
              </span>
              <i v-if="lang === localeValue" class="ri-check-line" />
            </button>
          </li>
        </MenuContent>
      </MenuDropdown>
    </Menu>

    <Menu>
      <MenuButton
        v-if="authStstus"
        :text="$t('views.settings.account')"
        icon="ri-user-4-line"
        @click="$router.push('/menu/settings/account')"
      />
      <MenuButton
        v-if="authStstus"
        :text="$t('views.settings.devices')"
        icon="ri-smartphone-line"
        @click="$router.push('/menu/settings/devices')"
      />
      <MenuButton
        v-if="authStstus"
        :text="$t('views.settings.api_keys')"
        icon="ri-key-2-line"
        @click="$router.push('/menu/settings/apikey')"
      />
    </Menu>

    <!-- Logout (non-TG only, when authenticated) -->
    <Menu v-if="!isTgEnv && authStstus">
      <MenuButton @click="logout" text="views.settings.logout" icon="ri-logout-box-line">
        <i class="ri-arrow-right-s-line text-xl opacity-50"></i>
      </MenuButton>
    </Menu>
    <!-- Version -->
    <div class="flex flex-col items-center gap-1 pt-2 pb-4 opacity-50 select-none">
      <p class="text-sm font-medium">
        {{ t('views.settings.version', { version: appVersion }) }}
      </p>
      <p class="text-xs font-mono">
        {{ buildHash }} &middot; {{ buildDate }}
      </p>
    </div>
  </div>
</template>
