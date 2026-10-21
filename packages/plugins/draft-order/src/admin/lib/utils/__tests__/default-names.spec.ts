import { describe, expect, it } from "vitest"

import {
  getItemTitle,
  getOptionValues,
  getVariantTitle,
  isDefaultVariantTitle,
} from "../default-names"

describe("isDefaultVariantTitle", () => {
  it.each([
    "Default variant",
    "default variant",
    "DEFAULT VARIANT",
    "Default",
    " Default variant ",
  ])("is true for the create form's name %j", (title) => {
    expect(isDefaultVariantTitle(title)).toBe(true)
  })

  it.each([
    "Negro",
    "M / Negro",
    "Default variant 2",
    "Variante por defecto",
    "",
    null,
    undefined,
  ])("is false for %j", (title) => {
    expect(isDefaultVariantTitle(title)).toBe(false)
  })
})

describe("getOptionValues", () => {
  it("leaves out the default option's value", () => {
    expect(getOptionValues([{ value: "Default option value" }])).toEqual([])
  })

  it("keeps a value the merchant named Default", () => {
    expect(
      getOptionValues([{ value: "Default option value" }, { value: "Default" }])
    ).toEqual(["Default"])
  })

  it("keeps a variant's real values in order", () => {
    expect(getOptionValues([{ value: "M" }, { value: "Negro" }])).toEqual([
      "M",
      "Negro",
    ])
  })

  it("drops only the default value among real ones", () => {
    expect(
      getOptionValues([{ value: "Negro" }, { value: "DEFAULT OPTION VALUE" }])
    ).toEqual(["Negro"])
  })

  it("is empty without options", () => {
    expect(getOptionValues(undefined)).toEqual([])
    expect(getOptionValues(null)).toEqual([])
    expect(getOptionValues([{ value: null }])).toEqual([])
  })
})

describe("getItemTitle", () => {
  it("names a product's one version by the product alone", () => {
    expect(
      getItemTitle("Taza de cerámica hecha a mano", "Default variant")
    ).toBe("Taza de cerámica hecha a mano")
  })

  it("adds a real variant's title in parentheses", () => {
    expect(getItemTitle("Remera", "M / Negro")).toBe("Remera (M / Negro)")
  })

  it("is the product alone when the variant has no title", () => {
    expect(getItemTitle("Remera", null)).toBe("Remera")
    expect(getItemTitle("Remera", undefined)).toBe("Remera")
  })
})

describe("getVariantTitle", () => {
  it("is the product's title for a product's one version", () => {
    expect(getVariantTitle("Default variant", "Llavero de cuero")).toBe(
      "Llavero de cuero"
    )
  })

  it("keeps a real variant's title", () => {
    expect(getVariantTitle("M / Negro", "Remera")).toBe("M / Negro")
  })

  it("keeps the default title when the product's is unknown", () => {
    expect(getVariantTitle("Default variant", undefined)).toBe(
      "Default variant"
    )
  })
})
