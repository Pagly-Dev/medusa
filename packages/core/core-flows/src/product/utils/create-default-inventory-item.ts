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

// Pagly: a variant as the rename check reads it: its title, its product's and
// the inventory items linked to it
type NamedVariant = {
  id: string
  title?: string | null
  product?: { title?: string | null } | null
  inventory_items?:
    | {
        inventory?: {
          id: string
          title?: string | null
          description?: string | null
        } | null
      }[]
    | null
}

/**
 * Pagly: the default inventory items to rename after variants or their
 * products were renamed. An item that still has the name it was given follows
 * the new one; an item the merchant renamed keeps theirs.
 */
export const renameDefaultInventoryItems = (
  before: NamedVariant[],
  after: Omit<NamedVariant, "inventory_items">[]
): InventoryTypes.UpdateInventoryItemInput[] => {
  const renames = new Map<string, InventoryTypes.UpdateInventoryItemInput>()

  for (const previous of before) {
    const current = after.find((variant) => variant.id === previous.id)

    if (!current) {
      continue
    }

    const oldTitle = inventoryItemTitle(previous.title, previous.product?.title)
    const newTitle = inventoryItemTitle(current.title, current.product?.title)

    if (!oldTitle || !newTitle || oldTitle === newTitle) {
      continue
    }

    for (const { inventory } of previous.inventory_items ?? []) {
      if (!inventory || inventory.title !== oldTitle) {
        continue
      }

      renames.set(inventory.id, {
        id: inventory.id,
        title: newTitle,
        ...(inventory.description === oldTitle && { description: newTitle }),
      })
    }
  }

  return [...renames.values()]
}
