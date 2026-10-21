// Red stub: the tests land before the code.
export const isDefaultVariantTitle = (_title?: string | null) => false

export const getOptionValues = (options?: { value?: string | null }[] | null) =>
  (options ?? []).map((option) => option.value)

export const getItemTitle = (
  productTitle?: string | null,
  variantTitle?: string | null
) => `${productTitle} (${variantTitle})`

export const getVariantTitle = (
  variantTitle?: string | null,
  _productTitle?: string | null
) => variantTitle ?? undefined
