// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AddClaimItemsTable } from "../../order-create-claim/components/add-claim-items-table/add-claim-items-table"
import { AddExchangeInboundItemsTable } from "../../order-create-exchange/components/add-exchange-inbound-items-table/add-exchange-inbound-items-table"
import { AddReturnItemsTable } from "../../order-create-return/components/add-return-items-table/add-return-items-table"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// The rows the table is given, in order: the tables search and sort the
// order's items themselves, before the data table sees them.
vi.mock("../../../../components/table/data-table", () => ({
  _DataTable: ({ table }: { table: any }) => (
    <ol>
      {table.getRowModel().rows.map((row: any) => (
        <li key={row.id}>{row.original.product_title}</li>
      ))}
    </ol>
  ),
}))

afterEach(() => {
  cleanup()
})

const line = (id: string, productTitle: string, variantTitle: string) => ({
  id,
  thumbnail: null,
  product_title: productTitle,
  variant_title: variantTitle,
  variant_sku: null,
  variant: { title: variantTitle },
  quantity: 1,
  refundable_total: 1000,
  created_at: "2026-10-20T12:00:00.000Z",
  updated_at: "2026-10-20T12:00:00.000Z",
  detail: {
    delivered_quantity: 1,
    return_received_quantity: 0,
    return_requested_quantity: 0,
    return_dismissed_quantity: 0,
  },
})

const items = [
  line("item_shirt", "Remera", "M / Negro"),
  line("item_mug", "Taza de cerámica", "Default variant"),
  line("item_coat", "Abrigo", "XL / Gris"),
]

const shown = () =>
  screen.queryAllByRole("listitem").map((item) => item.textContent)

describe.each([
  ["return", AddReturnItemsTable],
  ["claim", AddClaimItemsTable],
  ["exchange", AddExchangeInboundItemsTable],
] as const)("the %s items table", (_, Table) => {
  const renderAt = (search: string) =>
    render(
      <MemoryRouter initialEntries={[`/${search}`]}>
        <Table
          items={items as any}
          selectedItems={[]}
          onSelectionChange={() => {}}
          currencyCode="uyu"
        />
      </MemoryRouter>
    )

  it("orders by variant as the column shows it, a product's one version by the product's title", () => {
    renderAt("?rit_order=variant_title")

    expect(shown()).toEqual(["Remera", "Taza de cerámica", "Abrigo"])
  })

  it("does not find a product's one version by the default name it no longer shows", () => {
    renderAt("?rit_q=default")

    expect(shown()).toEqual([])
  })

  it("still finds it by the product's title", () => {
    renderAt("?rit_q=taza")

    expect(shown()).toEqual(["Taza de cerámica"])
  })
})
