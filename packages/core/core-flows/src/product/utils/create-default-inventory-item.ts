import { InventoryTypes } from "@medusajs/framework/types"

/**
 * The variant fields that are carried over to its default inventory item.
 */
type VariantInventoryInput = Pick<
  InventoryTypes.CreateInventoryItemInput,
  | "sku"
  | "origin_country"
  | "mid_code"
  | "material"
  | "weight"
  | "length"
  | "height"
  | "width"
  | "hs_code"
> & {
  title?: string | null
}

// Pagly: the titles the dashboard's create form gives a product's only variant
const DEFAULT_VARIANT_TITLES = ["default variant", "default"]

// Pagly: names the item after its product, so a product in one version does not
// show "Default variant" on inventory screens; a named variant follows it.
const inventoryItemTitle = (
  variantTitle?: string | null,
  productTitle?: string | null
) => {
  const product = productTitle?.trim()
  const variant = variantTitle?.trim()

  if (!product) {
    return variantTitle
  }

  if (
    !variant ||
    DEFAULT_VARIANT_TITLES.includes(variant.toLowerCase()) ||
    variant.toLowerCase() === product.toLowerCase()
  ) {
    return product
  }

  return `${product} · ${variant}`
}

/**
 * Builds the default inventory item for a variant that manages its inventory
 * without any inventory items of its own. Shared by the create and update
 * paths so both produce the same item.
 */
export const createDefaultInventoryItem = (
  variant: VariantInventoryInput,
  // Pagly: the variant's product title, which the item is named after
  productTitle?: string | null
): InventoryTypes.CreateInventoryItemInput => {
  const title = inventoryItemTitle(variant.title, productTitle)

  return {
    sku: variant.sku,
    origin_country: variant.origin_country,
    mid_code: variant.mid_code,
    material: variant.material,
    weight: variant.weight,
    length: variant.length,
    height: variant.height,
    width: variant.width,
    title,
    description: title,
    hs_code: variant.hs_code,
    requires_shipping: true,
  }
}
