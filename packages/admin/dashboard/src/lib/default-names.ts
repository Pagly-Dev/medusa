export const isDefaultVariantTitle = (_title?: string | null) => false

export const isDefaultOptionValue = (_value?: string | null) => false

export const getVariantTitle = (
  variantTitle?: string | null,
  _productTitle?: string | null
) => variantTitle ?? undefined

export const getOptionValues = (options?: { value?: string | null }[] | null) =>
  (options ?? []).map((option) => option.value)
