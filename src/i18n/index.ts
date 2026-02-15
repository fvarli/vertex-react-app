import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import commonEn from './resources/en/common.json'
import layoutEn from './resources/en/layout.json'
import authEn from './resources/en/auth.json'
import pagesEn from './resources/en/pages.json'
import commonTr from './resources/tr/common.json'
import layoutTr from './resources/tr/layout.json'
import authTr from './resources/tr/auth.json'
import pagesTr from './resources/tr/pages.json'

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          common: commonEn,
          layout: layoutEn,
          auth: authEn,
          pages: pagesEn,
        },
        tr: {
          common: commonTr,
          layout: layoutTr,
          auth: authTr,
          pages: pagesTr,
        },
      },
      fallbackLng: 'tr',
      supportedLngs: ['tr', 'en'],
      defaultNS: 'common',
      ns: ['common', 'layout', 'auth', 'pages'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: 'vertex_locale',
        caches: ['localStorage'],
      },
    })
}

export default i18n
