// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  draftOrder,
  mugItem,
  pageText,
  shirtItem,
} from "../../../__tests__/fixtures/one-version-items"
import { inSpanish } from "../../../__tests__/fixtures/i18n"
import { openActionMenu } from "../../../__tests__/fixtures/menus"
import { SummarySection } from "../summary-section"

vi.mock("../../../hooks/api/draft-orders", () => ({
  useConvertDraftOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

afterEach(() => {
  cleanup()
})

const renderSummary = (items: unknown[]) =>
  render(
    <MemoryRouter>
      <SummarySection order={draftOrder({ items })} />
    </MemoryRouter>
  )

describe("SummarySection", () => {
  it("names a product's one version by the product alone", () => {
    renderSummary([mugItem])

    expect(screen.getByText("Taza de cerámica hecha a mano")).toBeTruthy()
    expect(pageText()).not.toContain("Default variant")
  })

  it("keeps a real variant's title next to its product", () => {
    renderSummary([mugItem, shirtItem])

    expect(screen.getByText("Remera")).toBeTruthy()
    expect(screen.getByText("(M / Negro)")).toBeTruthy()
    expect(pageText()).not.toContain("Default variant")
  })

  it("matches the default title in any case", () => {
    renderSummary([{ ...mugItem, variant_title: "default" }])

    expect(screen.getByText("Taza de cerámica hecha a mano")).toBeTruthy()
    expect(screen.queryByText("(default)")).toBeNull()
  })
})

describe("SummarySection in Spanish", () => {
  inSpanish()

  it("labels the summary and its totals", () => {
    renderSummary([mugItem, shirtItem])

    expect(screen.getByText("Resumen")).toBeTruthy()
    expect(screen.getByText("3 artículos")).toBeTruthy()
    for (const label of ["Subtotal", "Envío", "Descuento", "Impuesto", "Total"]) {
      expect(screen.getByText(label)).toBeTruthy()
    }
    expect(
      screen.getByRole("button", { name: "Convertir en pedido" })
    ).toBeTruthy()
  })

  it("counts a single item in the singular", () => {
    renderSummary([{ ...mugItem, quantity: 1 }])

    expect(screen.getByText("1 artículo")).toBeTruthy()
  })

  it("names the menu's edits", () => {
    renderSummary([mugItem])
    openActionMenu()

    expect(
      screen.getByRole("menuitem", { name: "Editar artículos" })
    ).toBeTruthy()
    expect(
      screen.getByRole("menuitem", { name: "Editar promociones" })
    ).toBeTruthy()
  })

  it("asks before converting the draft", async () => {
    renderSummary([mugItem])
    fireEvent.click(screen.getByRole("button", { name: "Convertir en pedido" }))

    expect(await screen.findByText("¿Estás seguro?")).toBeTruthy()
    expect(
      screen.getByText(
        "Vas a convertir este pedido borrador en un pedido. Esta acción no se puede deshacer."
      )
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: "Continuar" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy()
  })
})
