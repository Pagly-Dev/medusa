/**
 * Pagly: the product create form names a product that comes in one version
 * in English: option "Default option", value "Default option value", variant
 * "Default variant". The names stay as data (the storefront hides the variant
 * by its title), so screens leave them out or show the product's title.
 */
const DEFAULT_VARIANT_TITLES = new Set(["default variant", "default"])
const DEFAULT_OPTION_VALUES = new Set(["default option value", "default"])

const isOneOf = (names: Set<string>, name?: string | null) =>
  !!name && names.has(name.trim().toLowerCase())

/** Whether a variant's title is the create form's name for a product's one version. */
export const isDefaultVariantTitle = (title?: string | null) =>
  isOneOf(DEFAULT_VARIANT_TITLES, title)

/** Whether an option value is the create form's value for the default option. */
export const isDefaultOptionValue = (value?: string | null) =>
  isOneOf(DEFAULT_OPTION_VALUES, value)

/** A variant's title, or its product's for a product's one version. */
export const getVariantTitle = (
  variantTitle?: string | null,
  productTitle?: string | null
) =>
  (isDefaultVariantTitle(variantTitle) && productTitle) ||
  variantTitle ||
  undefined

/** A variant's option values, without the default option's value. */
export const getOptionValues = (options?: { value?: string | null }[] | null) =>
  (options ?? [])
    .map((option) => option.value)
    .filter((value): value is string => !!value && !isDefaultOptionValue(value))

// Red stub: the tests land before the code.
export const isDefaultOption = (_option: {
  values?: { value?: string | null }[] | null
}) => false
