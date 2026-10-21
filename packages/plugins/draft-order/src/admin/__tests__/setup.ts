import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import { resources } from "./fixtures/i18n"

// The dashboard's i18next setup (`I18n` and `defaultI18nOptions`), in English
// unless a spec switches language.
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  fallbackNS: "translation",
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false,
})
