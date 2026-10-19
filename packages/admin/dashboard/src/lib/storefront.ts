export const MEDUSA_STOREFRONT_URL =
  __STOREFRONT_URL__ ?? "http://localhost:8000"

/**
 * Pagly: the online store's address for a storefront path such as
 * `/products/blusa`. The storefront adds the country itself.
 */
export const storefrontUrl = (path: string) =>
  `${MEDUSA_STOREFRONT_URL.replace(/\/$/, "")}${path}`
