// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import en from "../../../../../i18n/translations/en.json"
import es from "../../../../../i18n/translations/es.json"
import { ProductOptionSection } from "../product-option-section"
import { keychain, mug, pageText, shirt } from "./one-version-product"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

afterEach(() => {
  cleanup()
})

const renderSection = (product: unknown) =>
  render(
    <MemoryRouter>
      <ProductOptionSection product={product as any} />
    </MemoryRouter>
  )

describe("ProductOptionSection", () => {
  describe("a product that comes in one version", () => {
    it("leaves out the default option and its value", () => {
      renderSection(mug)

      expect(pageText()).not.toContain("Default option")
    })

    it("says the product comes in one version", () => {
      renderSection(mug)

      expect(screen.getByText("products.options.oneVersion")).toBeTruthy()
    })

    it("keeps the menu that manages the options", () => {
      renderSection(mug)

      expect(screen.getByText("products.options.header")).toBeTruthy()
      expect(
        screen
          .getAllByRole("button")
          .some((button) => button.getAttribute("aria-haspopup") === "menu")
      ).toBe(true)
    })
  })

  describe("a product with options", () => {
    it("lists each option with its values", () => {
      renderSection(shirt)

      expect(screen.getByText("Talle")).toBeTruthy()
      expect(screen.getByText("M")).toBeTruthy()
      expect(screen.getByText("Color")).toBeTruthy()
      expect(screen.getByText("Blanco")).toBeTruthy()
    })

    it("does not say the product comes in one version", () => {
      renderSection(shirt)

      expect(screen.queryByText("products.options.oneVersion")).toBeNull()
    })

    it("leaves out a default option it still links", () => {
      renderSection(keychain)

      expect(screen.getByText("Color")).toBeTruthy()
      expect(screen.getByText("Negro")).toBeTruthy()
      expect(pageText()).not.toContain("Default option")
      expect(screen.queryByText("products.options.oneVersion")).toBeNull()
    })
  })
})

describe("the one-version copy", () => {
  it.each([
    ["en", en],
    ["es", es],
  ])("is in %s and points at the menu's Manage action", (_lang, locale) => {
    const copy = (locale as any).products.options.oneVersion

    expect(copy).toEqual(expect.any(String))
    expect(copy).toContain(locale.actions.manage)
  })
})
