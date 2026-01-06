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
import { isTgEnv, currentTheme, setTheme, type Theme } from '@/main'

const { locale, t } = useI18n()
const localeValue = ref(locale.value)

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

  <div class="flex flex-col gap-6 p-4">
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
      <MenuButton :text="$t('views.settings.account')" icon="ri-user-4-line" />
      <MenuButton
        :text="$t('views.settings.devices')"
        icon="ri-smartphone-line"
        @click="$router.push('/menu/settings/devices')"
      />
      <MenuButton :text="$t('views.settings.api_keys')" icon="ri-key-2-line" @click="$router.push('/menu/settings/apikey')"/>
      <MenuButton :text="$t('views.settings.about')" icon="ri-information-line" @click="$router.push('/menu/about')"/>
    </Menu>

    <Menu v-show="!isTgEnv">
      <MenuButton
        @click="logout"
        classes="btn-warning"
        :text="$t('views.settings.logout')"
        icon="ri-logout-box-line"
      >
        <i class="ri-arrow-right-s-line text-2xl"></i>
      </MenuButton>
    </Menu>
  </div>
</template>
