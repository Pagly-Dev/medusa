import { ProductCategoryRepository } from "../product-category"

const build = (
  fields: string[],
  family: { includeDescendantsTree?: boolean; includeAncestorsTree?: boolean }
) =>
  ProductCategoryRepository.prototype.buildFindOptions.call(
    {},
    { where: {}, options: { fields: [...fields] } } as any,
    family
  )

describe("ProductCategoryRepository", () => {
  describe("buildFindOptions", () => {
    // A tree is sorted by rank once it is built, so a tree asked for with
    // only some fields - the admin's category list asks for id, name,
    // handle and children - came back in creation order: every rank was
    // undefined.
    it("selects rank for a tree, which is sorted by it", () => {
      expect(
        build(["id", "name"], { includeDescendantsTree: true }).options!.fields
      ).toContain("rank")
      expect(
        build(["id", "name"], { includeAncestorsTree: true }).options!.fields
      ).toContain("rank")
    })

    it("leaves the fields of a list that is not a tree as asked", () => {
      expect(build(["id", "name"], {}).options!.fields).toEqual(["id", "name"])
    })
  })

  describe("sortCategoriesByRank", () => {
    it("puts each level of the tree in rank order", () => {
      const sorted = ProductCategoryRepository.prototype.sortCategoriesByRank.call(
        ProductCategoryRepository.prototype,
        [
          { id: "ropa", rank: 1, category_children: [] },
          {
            id: "hogar",
            rank: 0,
            category_children: [
              { id: "tazas", rank: 1 },
              { id: "platos", rank: 0 },
            ],
          },
        ] as any
      ) as any[]

      expect(sorted.map((row) => row.id)).toEqual(["hogar", "ropa"])
      expect(sorted[0].category_children.map((row) => row.id)).toEqual([
        "platos",
        "tazas",
      ])
    })
  })
})
