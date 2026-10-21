// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import { InventoryItemVariantsSection } from "../variants-section"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

afterEach(() => {
  cleanup()
})

const variants = [
  {
    id: "variant_keychain",
    title: "Default variant",
    product: { id: "prod_keychain", title: "Llavero de cuero" },
    options: [{ id: "optval_default", value: "Default option value" }],
  },
  {
    id: "variant_shirt",
    title: "M / Negro",
    product: { id: "prod_shirt", title: "Remera" },
    options: [
      { id: "optval_m", value: "M" },
      { id: "optval_black", value: "Negro" },
    ],
  },
] as any

const renderSection = () =>
  render(
    <MemoryRouter>
      <InventoryItemVariantsSection variants={variants} />
    </MemoryRouter>
  )

describe("InventoryItemVariantsSection", () => {
  it("names a product's one variant after the product", () => {
    renderSection()

    expect(screen.getByText("Llavero de cuero")).toBeTruthy()
    expect(screen.queryByText(/Default variant/)).toBeNull()
  })

  it("leaves out the default option's value", () => {
    renderSection()

    expect(screen.queryByText(/Default option value/)).toBeNull()
  })

  it("keeps a variant's own title and option values", () => {
    renderSection()

    expect(screen.getByText("M / Negro")).toBeTruthy()
    expect(screen.getByText("M ⋅ Negro")).toBeTruthy()
  })

  it("still links each variant to its page", () => {
    renderSection()

    const links = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))

    expect(links).toEqual([
      "/products/prod_keychain/variants/variant_keychain",
      "/products/prod_shirt/variants/variant_shirt",
    ])
  })
})
