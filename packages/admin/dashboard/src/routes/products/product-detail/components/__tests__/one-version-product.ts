/**
 * A product that comes in one version, named the create form's way, and a
 * product with real options that still links the default option.
 */
const defaultOption = {
  id: "opt_default",
  title: "Default option",
  values: [{ id: "optval_default", value: "Default option value", rank: 0 }],
}

const color = {
  id: "opt_color",
  title: "Color",
  values: [
    { id: "optval_black", value: "Negro", rank: 0 },
    { id: "optval_white", value: "Blanco", rank: 1 },
  ],
}

const size = {
  id: "opt_size",
  title: "Talle",
  values: [
    { id: "optval_m", value: "M", rank: 0 },
    { id: "optval_l", value: "L", rank: 1 },
  ],
}

export const mug = {
  id: "prod_mug",
  title: "Taza de cerámica hecha a mano",
  options: [defaultOption],
} as any

export const mugVariant = {
  id: "variant_mug",
  title: "Default variant",
  sku: "TAZA-1",
  thumbnail: null,
  manage_inventory: false,
  inventory_items: [],
  options: [{ ...defaultOption.values[0], option_id: defaultOption.id }],
} as any

export const shirt = {
  id: "prod_shirt",
  title: "Remera",
  options: [size, color],
} as any

export const shirtVariant = {
  id: "variant_shirt",
  title: "M / Negro",
  sku: "REMERA-M-NEGRO",
  thumbnail: null,
  manage_inventory: false,
  inventory_items: [],
  options: [
    { ...size.values[0], option_id: size.id },
    { ...color.values[0], option_id: color.id },
  ],
} as any

/** Took on Color but still links the default option (and its value). */
export const keychain = {
  id: "prod_keychain",
  title: "Llavero de cuero",
  options: [defaultOption, color],
} as any

export const keychainVariant = {
  id: "variant_keychain",
  title: "Negro",
  sku: "LLAVERO-NEGRO",
  thumbnail: null,
  manage_inventory: false,
  inventory_items: [],
  options: [
    { ...defaultOption.values[0], option_id: defaultOption.id },
    { ...color.values[0], option_id: color.id },
  ],
} as any

/** The page's text, so a test can say a name shows nowhere on it. */
export const pageText = () => document.body.textContent ?? ""
