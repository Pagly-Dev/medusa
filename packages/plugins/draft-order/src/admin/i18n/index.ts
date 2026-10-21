import en from "./en.json"
import es from "./es.json"

/**
 * Pagly: the plugin's catalogs. The admin's i18n crawl finds this file and the
 * dashboard merges it into its own resources, so screens call `t()` from
 * react-i18next with these keys or the dashboard's.
 */
export default {
  en: { translation: en },
  es: { translation: es },
}
