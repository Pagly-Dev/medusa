// @vitest-environment jsdom
import { TooltipProvider } from "@medusajs/ui"
import { cleanup, render, screen } from "@testing-library/react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useClaimItemTableColumns } from "../../order-create-claim/components/add-claim-items-table/use-claim-item-table-columns"
import { useExchangeItemTableColumns } from "../../order-create-exchange/components/add-exchange-inbound-items-table/use-exchange-item-table-columns"
import { useReturnItemTableColumns } from "../../order-create-return/components/add-return-items-table/use-return-item-table-columns"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

afterEach(() => {
  cleanup()
})

const detail = {
  delivered_quantity: 1,
  return_received_quantity: 0,
  return_requested_quantity: 0,
  return_dismissed_quantity: 0,
}

const items = [
  {
    id: "item_keychain",
    thumbnail: null,
    product_title: "Llavero de cuero",
    variant_title: "Default variant",
    variant: { sku: "LLAVERO", title: "Default variant" },
    quantity: 1,
    refundable_total: 1200,
    detail,
  },
  {
    id: "item_shirt",
    thumbnail: null,
    product_title: "Remera",
    variant_title: "M / Negro",
    variant: { sku: "REMERA-M-NEGRO", title: "M / Negro" },
    quantity: 1,
    refundable_total: 890,
    detail,
  },
]

const ItemsTable = ({
  useColumns,
}: {
  useColumns: (currencyCode: string) => ColumnDef<any, any>[]
}) => {
  const columns = useColumns("uyu")
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <TooltipProvider>
      <table>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  data-testid={`${row.original.id}:${cell.column.id}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TooltipProvider>
  )
}

describe.each([
  ["return", useReturnItemTableColumns],
  ["claim", useClaimItemTableColumns],
  ["exchange", useExchangeItemTableColumns],
] as const)("the %s items table", (_, useColumns) => {
  it("names a product's one variant after the product", () => {
    render(<ItemsTable useColumns={useColumns as any} />)

    expect(screen.getByTestId("item_keychain:variant_title").textContent).toBe(
      "Llavero de cuero"
    )
    expect(screen.queryByText(/Default variant/)).toBeNull()
  })

  it("keeps a variant's own title", () => {
    render(<ItemsTable useColumns={useColumns as any} />)

    expect(screen.getByTestId("item_shirt:variant_title").textContent).toBe(
      "M / Negro"
    )
  })
})
