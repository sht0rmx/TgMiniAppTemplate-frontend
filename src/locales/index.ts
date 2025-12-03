import en from './lo/en.json'
import ru from './lo/ru.json'
import { createI18n } from 'vue-i18n'

function getLangFromCookie(): string | null {
  const match: RegExpMatchArray | null = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/)

  if (match && match[1]) {
    return decodeURIComponent(match[1])
  }

  return null
}

const savedLocale: string | null = getLangFromCookie()

const userLocale: string = savedLocale || navigator.language
const locale: string = userLocale.split('-')[0]!

export const supported: string[] = ['en', 'ru']
const finalLocale: string = supported.includes(locale) ? locale : 'en'

interface MessageSchema {
  [key: string]: any
}

const i18n = createI18n({
  legacy: false,
  locale: finalLocale,
  fallbackLocale: 'en',
  messages: {
    en: en as MessageSchema,
    ru: ru as MessageSchema,
  },
})

export { i18n }
