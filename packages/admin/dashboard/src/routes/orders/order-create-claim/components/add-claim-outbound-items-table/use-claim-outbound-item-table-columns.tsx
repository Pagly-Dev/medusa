import { Checkbox } from "@medusajs/ui"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  ProductCell,
  ProductHeader,
} from "../../../../../components/table/table-cells/product/product-cell"
import {
  VariantInventoryCell,
  VariantInventoryHeader,
} from "../../../../../components/table/table-cells/product/variant-inventory-cell"
import { getVariantTitle } from "../../../../../lib/default-names"

const columnHelper = createColumnHelper<any>()

export const useClaimOutboundItemTableColumns = (currencyCode: string) => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : table.getIsAllPageRowsSelected()
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          )
        },
        cell: ({ row }) => {
          const isSelectable = row.getCanSelect()

          return (
            <Checkbox
              disabled={!isSelectable}
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          )
        },
      }),
      columnHelper.display({
        id: "product",
        header: () => <ProductHeader />,
        cell: ({ row }) => {
          return <ProductCell product={row.original.product} />
        },
      }),
      columnHelper.accessor("sku", {
        header: t("fields.sku"),
        cell: ({ getValue }) => {
          return getValue() || "-"
        },
      }),
      columnHelper.accessor("title", {
        header: t("fields.title"),
        // Pagly: a product's one version is named after the product.
        cell: ({ getValue, row }) =>
          getVariantTitle(getValue(), row.original.product?.title),
      }),
      columnHelper.display({
        id: "inventory",
        header: () => <VariantInventoryHeader />,
        cell: ({ row }) => <VariantInventoryCell variant={row.original} />,
      }),
    ],
    [t, currencyCode]
  )
}
