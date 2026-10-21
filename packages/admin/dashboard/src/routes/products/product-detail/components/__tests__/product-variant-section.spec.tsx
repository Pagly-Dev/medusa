// @vitest-environment jsdom
import { TooltipProvider } from "@medusajs/ui"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

vi.hoisted(() => {
  const g = global as any
  g.__BACKEND_URL__ = "http://localhost:9000"
  g.__AUTH_TYPE__ = "session"
  g.__JWT_TOKEN_STORAGE_KEY__ = ""
})

import { ProductVariantSection } from "../product-variant-section"
import {
  keychain,
  keychainVariant,
  mug,
  mugVariant,
  pageText,
  shirt,
  shirtVariant,
} from "./one-version-product"

const variants = vi.hoisted(() => ({ current: [] as unknown[] }))

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { title?: string }) =>
      options?.title ? `${key}: ${options.title}` : key,
    i18n: { language: "es" },
  }),
}))

vi.mock("../../../../../hooks/api/products", () => ({
  useProductVariants: () => ({
    variants: variants.current,
    count: variants.current.length,
    isPending: false,
    isError: false,
  }),
  useDeleteVariantLazy: () => ({ mutateAsync: () => Promise.resolve() }),
}))

vi.mock("../../../../../providers/feature-flag-provider", () => ({
  useFeatureFlag: () => false,
}))

beforeAll(() => {
  // jsdom has no scrolling; the data table scrolls to the top on render.
  Element.prototype.scroll = () => {}
})

afterEach(() => {
  cleanup()
  variants.current = []
})

const renderSection = (product: unknown, rows: unknown[]) => {
  variants.current = rows

  return render(
    <MemoryRouter>
      <TooltipProvider>
        <ProductVariantSection product={product as any} />
      </TooltipProvider>
    </MemoryRouter>
  )
}

const columnHeaders = () =>
  screen.getAllByRole("columnheader").map((header) => header.textContent)

const rowOf = (sku: string) => screen.getByText(sku).closest("tr")!

describe("ProductVariantSection", () => {
  describe("a product that comes in one version", () => {
    it("names its variant after the product", () => {
      renderSection(mug, [mugVariant])

      expect(
        within(rowOf("TAZA-1")).getByText("Taza de cerámica hecha a mano")
      ).toBeTruthy()
      expect(pageText()).not.toContain("Default variant")
    })

    it("has no column for the default option", () => {
      renderSection(mug, [mugVariant])

      expect(columnHeaders()).not.toContain("Default option")
      expect(pageText()).not.toContain("Default option value")
    })

    it("names the product in the variant's delete prompt", async () => {
      renderSection(mug, [mugVariant])

      const menu = within(rowOf("TAZA-1"))
        .getAllByRole("button")
        .find((button) => button.getAttribute("aria-haspopup") === "menu")!
      fireEvent.keyDown(menu, { key: "Enter" })
      fireEvent.click(
        await screen.findByRole("menuitem", { name: "actions.delete" })
      )

      const warning = await screen.findByText(/products\.deleteVariantWarning/)
      expect(warning.textContent).toBe(
        "products.deleteVariantWarning: Taza de cerámica hecha a mano"
      )
    })
  })

  describe("a product with options", () => {
    it("keeps the variant's title and a column per option", () => {
      renderSection(shirt, [shirtVariant])

      const row = rowOf("REMERA-M-NEGRO")
      expect(within(row).getByText("M / Negro")).toBeTruthy()
      expect(within(row).getByText("M")).toBeTruthy()
      expect(within(row).getByText("Negro")).toBeTruthy()
      expect(columnHeaders()).toEqual(
        expect.arrayContaining(["Talle", "Color"])
      )
    })

    it("has no column for a default option it still links", () => {
      renderSection(keychain, [keychainVariant])

      expect(columnHeaders()).toContain("Color")
      expect(columnHeaders()).not.toContain("Default option")
      expect(pageText()).not.toContain("Default option value")
    })
  })
})
