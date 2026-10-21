/// <reference types="vite/client" />
import { deepMerge } from "@medusajs/admin-shared"
import i18n from "i18next"
import { afterEach, beforeEach } from "vitest"

import dashboardEn from "../../../../../../admin/dashboard/src/i18n/translations/en.json"
import dashboardEs from "../../../../../../admin/dashboard/src/i18n/translations/es.json"

type Resources = Record<string, { translation: Record<string, unknown> }>

/**
 * The plugin's catalogs, as the admin's `i18n` crawl finds them: the default
 * export of `src/admin/i18n/index.ts`, or nothing while that file is missing.
 */
export const pluginResources = (Object.values(
  import.meta.glob("../../i18n/index.ts", { eager: true, import: "default" })
)[0] ?? {}) as Resources

export const dashboardResources: Resources = {
  en: { translation: dashboardEn },
  es: { translation: dashboardEs },
}

/** What the dashboard hands i18next: its own catalogs with each plugin's merged in. */
export const resources: Resources = deepMerge(
  dashboardResources,
  pluginResources
)

/** Renders the specs of the enclosing `describe` with the admin in Spanish. */
export const inSpanish = () => {
  beforeEach(async () => {
    await i18n.changeLanguage("es")
  })

  afterEach(async () => {
    await i18n.changeLanguage("en")
  })
}
