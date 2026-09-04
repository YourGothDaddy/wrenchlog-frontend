import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import bg from './locales/bg.json'

const STORAGE_KEY = 'wrenchlog_language'
const storedLanguage = localStorage.getItem(STORAGE_KEY)

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            bg: { translation: bg }
        },
        lng: storedLanguage || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    })

export function changeLanguage(language) {
    i18n.changeLanguage(language)
    localStorage.setItem(STORAGE_KEY, language)
}

export default i18n