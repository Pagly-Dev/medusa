/**
 * Line items of a draft order: a mug that comes in one version, named the
 * create form's way ("Default variant" / "Default option value"), and a
 * shirt with real options.
 */
const shippingProfile = { id: "sp_default", name: "Default Shipping Profile" }

export const mugItem = {
  id: "item_mug",
  title: "Taza de cerámica hecha a mano",
  subtitle: "Default variant",
  product_title: "Taza de cerámica hecha a mano",
  variant_title: "Default variant",
  variant_id: "variant_mug",
  variant_sku: "TAZA-1",
  thumbnail: null,
  quantity: 2,
  unit_price: 950,
  subtotal: 1900,
  variant: {
    id: "variant_mug",
    title: "Default variant",
    options: [
      {
        id: "optval_default",
        value: "Default option value",
        option: { id: "opt_default", title: "Default option" },
      },
    ],
    product: {
      id: "prod_mug",
      title: "Taza de cerámica hecha a mano",
      shipping_profile: shippingProfile,
    },
  },
} as any

export const shirtItem = {
  id: "item_shirt",
  title: "Remera",
  subtitle: "M / Negro",
  product_title: "Remera",
  variant_title: "M / Negro",
  variant_id: "variant_shirt",
  variant_sku: "REMERA-M-NEGRO",
  thumbnail: null,
  quantity: 1,
  unit_price: 890,
  subtotal: 890,
  variant: {
    id: "variant_shirt",
    title: "M / Negro",
    options: [
      {
        id: "optval_m",
        value: "M",
        option: { id: "opt_size", title: "Talle" },
      },
      {
        id: "optval_black",
        value: "Negro",
        option: { id: "opt_color", title: "Color" },
      },
    ],
    product: {
      id: "prod_shirt",
      title: "Remera",
      shipping_profile: shippingProfile,
    },
  },
} as any

export const shippingOption = {
  id: "so_moto",
  name: "Envío Montevideo — moto",
  shipping_profile_id: shippingProfile.id,
  shipping_profile: shippingProfile,
  service_zone: {
    fulfillment_set: { location: { id: "sloc_1", name: "Depósito Centro" } },
  },
} as any

export const draftOrder = (overrides: Record<string, unknown> = {}) =>
  ({
    id: "order_draft",
    currency_code: "uyu",
    items: [mugItem, shirtItem],
    shipping_methods: [],
    promotions: [],
    total: 2790,
    item_subtotal: 2790,
    shipping_subtotal: 0,
    discount_total: 0,
    tax_total: 0,
    ...overrides,
  } as any)

/** The page's text, so a test can say a name shows nowhere on it. */
export const pageText = () => document.body.textContent ?? ""
