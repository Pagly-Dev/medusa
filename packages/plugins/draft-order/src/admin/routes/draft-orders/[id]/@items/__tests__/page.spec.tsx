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

import {
  mugItem,
  pageText,
  shirtItem,
} from "../../../../../__tests__/fixtures/one-version-items"
import { inSpanish } from "../../../../../__tests__/fixtures/i18n"
import { openActionMenu } from "../../../../../__tests__/fixtures/menus"
import Items from "../page"

const mutation = vi.hoisted(() => () => ({
  mutateAsync: () => Promise.resolve(),
  isPending: false,
}))

vi.mock("../../../../../components/modals", async () =>
  (await import("../../../../../__tests__/fixtures/modals")).modalsMock()
)

vi.mock("../../../../../hooks/api/draft-orders", () => ({
  useDraftOrder: () => ({
    draft_order: { id: "order_draft", currency_code: "uyu" },
    isPending: false,
    isError: false,
  }),
  useDraftOrderAddItems: mutation,
  useDraftOrderConfirmEdit: mutation,
  useDraftOrderRemoveActionItem: mutation,
  useDraftOrderRequestEdit: mutation,
  useDraftOrderUpdateActionItem: mutation,
  useDraftOrderUpdateItem: mutation,
}))

vi.mock("../../../../../hooks/api/orders", async () => {
  const { mugItem, shirtItem } = await import(
    "../../../../../__tests__/fixtures/one-version-items"
  )

  return {
    useOrderPreview: () => ({
      order: {
        id: "order_draft",
        items: [mugItem, shirtItem],
        item_subtotal: 2790,
      },
      isPending: false,
      isError: false,
    }),
  }
})

vi.mock("../../../../../hooks/api/product-variants", () => ({
  useProductVariants: () => ({
    variants: [
      {
        id: "variant_llavero",
        title: "Default variant",
        sku: "LLAVERO",
        manage_inventory: false,
        updated_at: "2026-10-20T12:00:00.000Z",
        product: { id: "prod_llavero", title: "Llavero de cuero" },
      },
      {
        id: "variant_buzo",
        title: "L / Gris",
        sku: "BUZO-L-GRIS",
        manage_inventory: false,
        updated_at: "2026-10-20T12:00:00.000Z",
        product: { id: "prod_buzo", title: "Buzo canguro" },
      },
    ],
    count: 2,
    isPending: false,
    isError: false,
  }),
}))

vi.mock("../../../../../hooks/order-edits/use-cancel-order-edit", () => ({
  useCancelOrderEdit: () => ({ onCancel: vi.fn() }),
}))

vi.mock("../../../../../hooks/order-edits/use-initiate-order-edit", () => ({
  useInitiateOrderEdit: () => {},
}))

beforeAll(() => {
  // jsdom has no scrolling; the data table scrolls to the top on render.
  Element.prototype.scroll = () => {}
})

afterEach(() => {
  cleanup()
})

const renderItems = () =>
  render(
    <MemoryRouter>
      <TooltipProvider>
        <Items />
      </TooltipProvider>
    </MemoryRouter>
  )

/** Opens the "+" menu and picks "Add items", which lists the catalog's variants. */
const openVariantPicker = () => {
  const plus = screen
    .getAllByRole("button")
    .find((button) => button.getAttribute("aria-haspopup") === "menu")!
  fireEvent.keyDown(plus, { key: "Enter" })
  fireEvent.click(screen.getByRole("menuitem", { name: "Add items" }))
}

describe("Edit items", () => {
  it("names a product's one version by the product alone", () => {
    renderItems()

    expect(screen.getByText(mugItem.product_title)).toBeTruthy()
    expect(pageText()).not.toContain("Default variant")
  })

  it("keeps a real variant's title next to its product", () => {
    renderItems()

    expect(screen.getByText(shirtItem.product_title)).toBeTruthy()
    expect(screen.getByText("(M / Negro)")).toBeTruthy()
  })

  describe("the variant picker", () => {
    it("names a product's one version after the product", () => {
      renderItems()
      openVariantPicker()

      const row = screen.getByText("LLAVERO").closest("tr")!
      expect(within(row).getAllByText("Llavero de cuero")).toHaveLength(2)
      expect(pageText()).not.toContain("Default variant")
    })

    it("keeps a real variant's title", () => {
      renderItems()
      openVariantPicker()

      const row = screen.getByText("BUZO-L-GRIS").closest("tr")!
      expect(within(row).getByText("L / Gris")).toBeTruthy()
    })
  })
})

describe("Edit items in Spanish", () => {
  inSpanish()

  it("labels the items form", () => {
    renderItems()

    expect(screen.getByText("Editar artículos")).toBeTruthy()
    expect(screen.getByText("Artículos")).toBeTruthy()
    expect(
      screen.getByText("Elegí artículos del catálogo de productos.")
    ).toBeTruthy()
    expect(screen.getByPlaceholderText("Buscar artículos")).toBeTruthy()
    for (const header of ["Artículo", "Cantidad", "Precio", "Subtotal"]) {
      expect(screen.getByText(header)).toBeTruthy()
    }
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Guardar" })).toBeTruthy()
  })

  it("names the add menu's choices", () => {
    renderItems()
    openActionMenu()

    expect(
      screen.getByRole("menuitem", { name: "Agregar artículos" })
    ).toBeTruthy()
    expect(
      screen.getByRole("menuitem", { name: "Agregar artículo personalizado" })
    ).toBeTruthy()
  })

  it("labels the variant picker", () => {
    renderItems()
    openActionMenu()
    fireEvent.click(screen.getByRole("menuitem", { name: "Agregar artículos" }))

    expect(screen.getByText("Variantes de producto")).toBeTruthy()
    expect(
      screen.getByText("Elegí las variantes de producto para agregar al pedido.")
    ).toBeTruthy()
    for (const header of [
      "Producto",
      "Variante",
      "SKU",
      "Actualizado",
      "Creado",
      "Stock",
    ]) {
      expect(screen.getByText(header)).toBeTruthy()
    }
    expect(screen.getAllByText("No gestionado")).toHaveLength(2)
    expect(screen.getAllByText("20 oct 2026").length).toBeGreaterThan(0)
    expect(
      screen.getByRole("button", { name: "Actualizar artículos" })
    ).toBeTruthy()
  })
})
