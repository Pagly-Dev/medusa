import { createDefaultInventoryItem } from "../create-default-inventory-item"

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
