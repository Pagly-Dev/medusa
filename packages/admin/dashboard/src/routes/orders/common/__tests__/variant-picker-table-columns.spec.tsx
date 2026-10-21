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

import { useClaimOutboundItemTableColumns } from "../../order-create-claim/components/add-claim-outbound-items-table/use-claim-outbound-item-table-columns"
import { useOrderEditItemsTableColumns } from "../../order-create-edit/components/add-order-edit-items-table/use-order-edit-item-table-columns"
import { useExchangeOutboundItemTableColumns } from "../../order-create-exchange/components/add-exchange-outbound-items-table/use-exchange-outbound-item-table-columns"

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
    sku: "LLAVERO",
    manage_inventory: false,
    product: {
      id: "prod_keychain",
      title: "Llavero de cuero",
      thumbnail: null,
    },
  },
  {
    id: "variant_shirt",
    title: "M / Negro",
    sku: "REMERA-M-NEGRO",
    manage_inventory: false,
    product: { id: "prod_shirt", title: "Remera", thumbnail: null },
  },
]

const VariantsTable = ({
  useColumns,
}: {
  useColumns: (currencyCode: string) => ColumnDef<any, any>[]
}) => {
  const columns = useColumns("uyu")
  const table = useReactTable({
    data: variants,
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
  ["order edit's add items", useOrderEditItemsTableColumns],
  ["claim's items to send", useClaimOutboundItemTableColumns],
  ["exchange's items to send", useExchangeOutboundItemTableColumns],
] as const)("the %s table", (_, useColumns) => {
  it("names a product's one variant after the product", () => {
    render(<VariantsTable useColumns={useColumns as any} />)

    expect(screen.getByTestId("variant_keychain:title").textContent).toBe(
      "Llavero de cuero"
    )
    expect(screen.queryByText(/Default variant/)).toBeNull()
  })

  it("keeps a variant's own title", () => {
    render(<VariantsTable useColumns={useColumns as any} />)

    expect(screen.getByTestId("variant_shirt:title").textContent).toBe(
      "M / Negro"
    )
  })
})
