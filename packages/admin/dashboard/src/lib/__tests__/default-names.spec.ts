import { describe, expect, it } from "vitest"
import {
  getOptionValues,
  getVariantTitle,
  isDefaultOption,
  isDefaultOptionValue,
  isDefaultVariantTitle,
} from "../default-names"

describe("isDefaultVariantTitle", () => {
  it("matches the create form's name for a product's one variant", () => {
    expect(isDefaultVariantTitle("Default variant")).toBe(true)
  })

  it("ignores case and surrounding spaces", () => {
    expect(isDefaultVariantTitle("default variant")).toBe(true)
    expect(isDefaultVariantTitle("  DEFAULT VARIANT ")).toBe(true)
  })

  it("matches the shorter name the storefront also hides", () => {
    expect(isDefaultVariantTitle("Default")).toBe(true)
  })

  it("does not match a variant the merchant named", () => {
    expect(isDefaultVariantTitle("M / Negro")).toBe(false)
    expect(isDefaultVariantTitle("Default variant XL")).toBe(false)
  })

  it("does not match a missing title", () => {
    expect(isDefaultVariantTitle(undefined)).toBe(false)
    expect(isDefaultVariantTitle(null)).toBe(false)
    expect(isDefaultVariantTitle("")).toBe(false)
  })
})

describe("isDefaultOptionValue", () => {
  it("matches the create form's value for the default option", () => {
    expect(isDefaultOptionValue("Default option value")).toBe(true)
  })

  it("ignores case and surrounding spaces", () => {
    expect(isDefaultOptionValue(" default OPTION value ")).toBe(true)
  })

  it("does not match a value the merchant named", () => {
    expect(isDefaultOptionValue("Negro")).toBe(false)
    expect(isDefaultOptionValue("Default option")).toBe(false)
  })

  it("does not match a value the merchant named Default, which the create form never writes", () => {
    expect(isDefaultOptionValue("Default")).toBe(false)
    expect(isDefaultOptionValue("default")).toBe(false)
  })

  it("does not match a missing value", () => {
    expect(isDefaultOptionValue(undefined)).toBe(false)
    expect(isDefaultOptionValue(null)).toBe(false)
  })
})

describe("getVariantTitle", () => {
  it("names a product's one variant after the product", () => {
    expect(getVariantTitle("Default variant", "Llavero de cuero")).toBe(
      "Llavero de cuero"
    )
    expect(getVariantTitle("default variant", "Llavero de cuero")).toBe(
      "Llavero de cuero"
    )
  })

  it("keeps a variant's own title", () => {
    expect(getVariantTitle("M / Negro", "Remera")).toBe("M / Negro")
  })

  it("keeps the variant's title when the product's is missing", () => {
    expect(getVariantTitle("Default variant", undefined)).toBe(
      "Default variant"
    )
    expect(getVariantTitle("Default variant", null)).toBe("Default variant")
  })

  it("returns nothing for a missing variant title", () => {
    expect(getVariantTitle(undefined, "Remera")).toBeUndefined()
  })
})

describe("getOptionValues", () => {
  it("leaves out the default option's value", () => {
    expect(getOptionValues([{ value: "Default option value" }])).toEqual([])
  })

  it("keeps the values of options the merchant made, in order", () => {
    expect(getOptionValues([{ value: "M" }, { value: "Negro" }])).toEqual([
      "M",
      "Negro",
    ])
  })

  it("keeps the other values next to a default one", () => {
    expect(
      getOptionValues([{ value: "Default option value" }, { value: "Marrón" }])
    ).toEqual(["Marrón"])
  })

  it("keeps a value the merchant named Default", () => {
    expect(getOptionValues([{ value: "Default" }, { value: "Azul" }])).toEqual([
      "Default",
      "Azul",
    ])
  })

  it("returns no values for missing options", () => {
    expect(getOptionValues(undefined)).toEqual([])
    expect(getOptionValues(null)).toEqual([])
  })
})

describe("isDefaultOption", () => {
  const option = (title: string, ...values: string[]) => ({
    title,
    values: values.map((value) => ({ value })),
  })

  it("matches the create form's option, whose one value is the default", () => {
    expect(
      isDefaultOption(option("Default option", "Default option value"))
    ).toBe(true)
  })

  it("goes by the values, in any case, whatever the option's title", () => {
    expect(isDefaultOption(option("Opción", "DEFAULT OPTION VALUE"))).toBe(true)
  })

  it("does not match an option whose value is the merchant's Default", () => {
    expect(isDefaultOption(option("Modelo", "Default"))).toBe(false)
  })

  it("does not match an option with a value the merchant gave", () => {
    expect(
      isDefaultOption(option("Default option", "Default option value", "Negro"))
    ).toBe(false)
    expect(isDefaultOption(option("Color", "Negro"))).toBe(false)
  })

  it("does not match an option without values", () => {
    expect(isDefaultOption(option("Default option"))).toBe(false)
    expect(isDefaultOption({ values: null })).toBe(false)
  })
})
