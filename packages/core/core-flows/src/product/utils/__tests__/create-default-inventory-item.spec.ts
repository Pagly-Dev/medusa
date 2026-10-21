import * as defaultInventoryItem from "../create-default-inventory-item"

const { createDefaultInventoryItem } = defaultInventoryItem

describe("createDefaultInventoryItem", () => {
  it("names the item after the product when the variant is the default one", () => {
    const item = createDefaultInventoryItem(
      { title: "Default variant", sku: "TAZA-01" },
      "Taza de cerámica"
    )

    expect(item.title).toEqual("Taza de cerámica")
    expect(item.description).toEqual("Taza de cerámica")
  })

  it.each(["Default variant", "default variant", "Default", "  DEFAULT  "])(
    "treats %p as the default variant",
    (variantTitle) => {
      const item = createDefaultInventoryItem(
        { title: variantTitle },
        "Taza de cerámica"
      )

      expect(item.title).toEqual("Taza de cerámica")
      expect(item.description).toEqual("Taza de cerámica")
    }
  )

  it("names the item after the product when the variant has no title", () => {
    expect(createDefaultInventoryItem({}, "Taza de cerámica").title).toEqual(
      "Taza de cerámica"
    )
    expect(
      createDefaultInventoryItem({ title: null }, "Taza de cerámica").title
    ).toEqual("Taza de cerámica")
    expect(
      createDefaultInventoryItem({ title: "  " }, "Taza de cerámica").title
    ).toEqual("Taza de cerámica")
  })

  it("adds a named variant's title after the product's", () => {
    const item = createDefaultInventoryItem(
      { title: "S / Blanco" },
      "Remera básica"
    )

    expect(item.title).toEqual("Remera básica · S / Blanco")
    expect(item.description).toEqual("Remera básica · S / Blanco")
  })

  it("does not repeat a variant titled like its product", () => {
    const item = createDefaultInventoryItem(
      { title: "taza de cerámica" },
      "Taza de cerámica"
    )

    expect(item.title).toEqual("Taza de cerámica")
  })

  it("keeps the variant's title when the product's is not known", () => {
    expect(createDefaultInventoryItem({ title: "S / Blanco" }).title).toEqual(
      "S / Blanco"
    )
    expect(
      createDefaultInventoryItem({ title: "Default variant" }, null).title
    ).toEqual("Default variant")
    expect(
      createDefaultInventoryItem({ title: "Default variant" }, "  ").title
    ).toEqual("Default variant")
  })

  it("still carries the variant's other fields over", () => {
    const item = createDefaultInventoryItem(
      {
        title: "Default variant",
        sku: "TAZA-01",
        origin_country: "UY",
        mid_code: "mid",
        material: "Cerámica",
        weight: 350,
        length: 10,
        height: 9,
        width: 8,
        hs_code: "6912",
      },
      "Taza de cerámica"
    )

    expect(item).toEqual({
      sku: "TAZA-01",
      origin_country: "UY",
      mid_code: "mid",
      material: "Cerámica",
      weight: 350,
      length: 10,
      height: 9,
      width: 8,
      title: "Taza de cerámica",
      description: "Taza de cerámica",
      hs_code: "6912",
      requires_shipping: true,
    })
  })
})

describe("renameDefaultInventoryItems", () => {
  const rename = (
    before: Parameters<
      typeof defaultInventoryItem.renameDefaultInventoryItems
    >[0],
    after: Parameters<
      typeof defaultInventoryItem.renameDefaultInventoryItems
    >[1]
  ) => {
    expect(defaultInventoryItem.renameDefaultInventoryItems).toBeInstanceOf(
      Function
    )

    return defaultInventoryItem.renameDefaultInventoryItems(before, after)
  }

  const variant = (
    variantTitle: string,
    productTitle: string,
    item?: { title: string; description?: string }
  ) => ({
    id: "variant_1",
    title: variantTitle,
    product: { title: productTitle },
    inventory_items: item
      ? [
          {
            inventory: {
              id: "iitem_1",
              title: item.title,
              description: item.description ?? item.title,
            },
          },
        ]
      : [],
  })

  it("renames a one-version product's item when the product is renamed", () => {
    expect(
      rename(
        [variant("Default variant", "Taza blanca", { title: "Taza blanca" })],
        [variant("Default variant", "Taza de cerámica")]
      )
    ).toEqual([
      {
        id: "iitem_1",
        title: "Taza de cerámica",
        description: "Taza de cerámica",
      },
    ])
  })

  it("renames a named variant's item when its product is renamed", () => {
    expect(
      rename(
        [
          variant("S / Blanco", "Remera básica", {
            title: "Remera básica · S / Blanco",
          }),
        ],
        [variant("S / Blanco", "Remera de lino")]
      )
    ).toEqual([
      {
        id: "iitem_1",
        title: "Remera de lino · S / Blanco",
        description: "Remera de lino · S / Blanco",
      },
    ])
  })

  it("adds the variant's title once the default variant gets one of its own", () => {
    expect(
      rename(
        [
          variant("Default variant", "Remera básica", {
            title: "Remera básica",
          }),
        ],
        [variant("S", "Remera básica")]
      )
    ).toEqual([
      {
        id: "iitem_1",
        title: "Remera básica · S",
        description: "Remera básica · S",
      },
    ])
  })

  it("renames the item when a named variant is renamed", () => {
    expect(
      rename(
        [
          variant("S / Blanco", "Remera básica", {
            title: "Remera básica · S / Blanco",
          }),
        ],
        [variant("S / Crudo", "Remera básica")]
      )
    ).toEqual([
      {
        id: "iitem_1",
        title: "Remera básica · S / Crudo",
        description: "Remera básica · S / Crudo",
      },
    ])
  })

  it("leaves an item the merchant renamed", () => {
    expect(
      rename(
        [
          variant("Default variant", "Taza blanca", {
            title: "Taza (depósito)",
          }),
        ],
        [variant("Default variant", "Taza de cerámica")]
      )
    ).toEqual([])
  })

  it("keeps a description the merchant wrote", () => {
    expect(
      rename(
        [
          variant("Default variant", "Taza blanca", {
            title: "Taza blanca",
            description: "Hecha a mano en Colonia",
          }),
        ],
        [variant("Default variant", "Taza de cerámica")]
      )
    ).toEqual([{ id: "iitem_1", title: "Taza de cerámica" }])
  })

  it("changes nothing when neither name changed", () => {
    expect(
      rename(
        [variant("S / Blanco", "Remera", { title: "Remera · S / Blanco" })],
        [variant("S / Blanco", "Remera")]
      )
    ).toEqual([])
  })

  it("skips a variant that is gone after the update", () => {
    expect(
      rename(
        [variant("Default variant", "Taza blanca", { title: "Taza blanca" })],
        []
      )
    ).toEqual([])
  })

  it("skips a variant with no inventory item", () => {
    expect(
      rename(
        [variant("Default variant", "Taza blanca")],
        [variant("Default variant", "Taza de cerámica")]
      )
    ).toEqual([])
  })
})
