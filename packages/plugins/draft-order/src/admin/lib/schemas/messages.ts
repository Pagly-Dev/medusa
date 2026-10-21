import { getI18n } from "react-i18next"

/**
 * Pagly: zod messages in the admin's language. zod reads `error` when a check
 * fails, so a message follows the language the merchant has at that moment.
 */
export const required = {
  error: () => getI18n().t("draftOrders.validation.required"),
}

export const invalidEmail = {
  error: () => getI18n().t("draftOrders.validation.invalidEmail"),
}
