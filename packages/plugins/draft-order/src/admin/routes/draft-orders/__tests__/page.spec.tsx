// @vitest-environment jsdom
import { TooltipProvider } from "@medusajs/ui"
import { cleanup, render, screen } from "@testing-library/react"
import i18n from "i18next"
import type { ReactNode } from "react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { inSpanish } from "../../../__tests__/fixtures/i18n"
import List, { config, handle } from "../page"

vi.mock("@medusajs/dashboard/components", () => {
  const LayoutComposer = ({ sections }: { sections: { main: ReactNode } }) => (
    <>{sections.main}</>
  )
  LayoutComposer.Entry = ({ children }: { children: ReactNode }) => (
    <>{children}</>
  )
  return { LayoutComposer }
})

vi.mock("../../../hooks/api/draft-orders", () => ({
  useDraftOrders: () => ({
    draft_orders: [
      {
        id: "order_draft",
        display_id: 4,
        created_at: "2026-10-20T12:00:00.000Z",
        customer: { email: "ana@ejemplo.com" },
        sales_channel: { name: "Tienda online" },
        region: { name: "Uruguay" },
      },
    ],
    count: 1,
    isPending: false,
    isError: false,
  }),
}))

vi.mock("../../../hooks/api/customers", () => ({
  useCustomers: () => ({ customers: [] }),
}))

vi.mock("../../../hooks/api/sales-channels", () => ({
  useSalesChannels: () => ({ sales_channels: [] }),
}))

vi.mock("../../../hooks/api/regions", () => ({
  useRegions: () => ({ regions: [] }),
}))

beforeAll(() => {
  // jsdom has no scrolling; the data table scrolls to the top on render.
  Element.prototype.scroll = () => {}
})

afterEach(() => {
  cleanup()
})

const renderList = () =>
  render(
    <MemoryRouter>
      <TooltipProvider>
        <List />
      </TooltipProvider>
    </MemoryRouter>
  )

describe("Draft orders list in Spanish", () => {
  inSpanish()

  it("names the table's columns", () => {
    renderList()

    expect(screen.getByText("Pedidos Borradores")).toBeTruthy()
    for (const header of [
      "Pedido",
      "Fecha",
      "Cliente",
      "Canal de venta",
      "Región",
    ]) {
      expect(screen.getByText(header)).toBeTruthy()
    }
  })

  it("shows a draft's date in Spanish", () => {
    renderList()

    expect(screen.getByText("20 oct 2026")).toBeTruthy()
  })

  it("translates the breadcrumb and the sidebar label", () => {
    expect(handle.breadcrumb()).toBe("Pedidos Borradores")
    expect(
      i18n.t(config.label!, { ns: (config as any).translationNs })
    ).toBe("Borradores")
  })
})
