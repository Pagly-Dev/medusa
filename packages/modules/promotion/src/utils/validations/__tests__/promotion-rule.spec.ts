import { flattenObjectToKeyValuePairs } from "@medusajs/framework/utils"
import { areRulesValidForContext } from "../promotion-rule"

// Pagly: product_collection rules read the collection-sources link, a list per
// product, so they must behave like product_category rules.
const COLLECTION_ATTRIBUTE = "items.product.collection_memberships.collection_id"
const CATEGORY_ATTRIBUTE = "items.product.categories.id"

const rule = (attribute: string, operator: string, values: string[]) =>
  ({
    attribute,
    operator,
    values: values.map((value) => ({ value })),
  }) as any

const item = {
  id: "item_1",
  product: {
    id: "prod_1",
    categories: [{ id: "pcat_shoes" }, { id: "pcat_sale" }],
    collection_memberships: [
      { collection_id: "pcol_summer" },
      { collection_id: "pcol_sale" },
    ],
  },
}

describe("product collection rules", () => {
  it.each([
    ["in", ["pcol_sale"], true],
    ["in", ["pcol_winter"], false],
    ["ne", ["pcol_winter"], true],
    ["ne", ["pcol_sale"], false],
    ["eq", ["pcol_summer", "pcol_sale"], true],
    ["eq", ["pcol_sale"], false],
  ])("%s %j on an item in two collections is %s", (operator, values, valid) => {
    const categoryValues = values.map((v) => v.replace("pcol_", "pcat_"))
    const categoryItem = {
      ...item,
      product: {
        ...item.product,
        categories: [{ id: "pcat_summer" }, { id: "pcat_sale" }],
      },
    }

    expect(
      areRulesValidForContext(
        [rule(COLLECTION_ATTRIBUTE, operator, values)],
        item,
        "items"
      )
    ).toBe(valid)
    expect(
      areRulesValidForContext(
        [rule(CATEGORY_ATTRIBUTE, operator, categoryValues)],
        categoryItem,
        "items"
      )
    ).toBe(valid)
  })

  it("does not match an item in no collection", () => {
    const noCollections = {
      ...item,
      product: { ...item.product, collection_memberships: [] },
    }

    expect(
      areRulesValidForContext(
        [rule(COLLECTION_ATTRIBUTE, "in", ["pcol_sale"])],
        noCollections,
        "items"
      )
    ).toBe(false)
  })

  it("flattens every item's collections under the rule attribute for the prefilter", () => {
    const other = {
      id: "item_2",
      product: {
        id: "prod_2",
        categories: [],
        collection_memberships: [{ collection_id: "pcol_winter" }],
      },
    }

    const flattened = Object.fromEntries(
      Object.entries(flattenObjectToKeyValuePairs([item, other])).map(
        ([key, value]) => [`items.${key}`, value]
      )
    )

    expect(flattened[COLLECTION_ATTRIBUTE]).toEqual([
      "pcol_summer",
      "pcol_sale",
      "pcol_winter",
    ])
    expect(flattened[CATEGORY_ATTRIBUTE]).toEqual(["pcat_shoes", "pcat_sale"])
  })
})
