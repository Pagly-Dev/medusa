// @vitest-environment jsdom
import { AdminOrderLineItem } from "@medusajs/types"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import ActivityItems from "../activity-items"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

afterEach(() => {
  cleanup()
})

const lineItem = (item: Partial<AdminOrderLineItem>) =>
  ({ thumbnail: null, ...item } as AdminOrderLineItem)

const itemsMap = new Map<string, AdminOrderLineItem>([
  [
    "item_keychain",
    lineItem({
      id: "item_keychain",
      product_title: "Llavero de cuero",
      variant_title: "Default variant",
    }),
  ],
  [
    "item_shirt",
    lineItem({
      id: "item_shirt",
      product_title: "Remera",
      variant_title: "M / Negro",
    }),
  ],
])

const renderOpen = () => {
  render(
    <ActivityItems
      title="Exchange"
      itemsMap={itemsMap}
      itemsToSend={
        [{ id: "send_1", item_id: "item_keychain", quantity: 1 }] as any
      }
      itemsToReturn={
        [
          { id: "return_1", item_id: "item_shirt", quantity: 1 },
          { id: "return_2", item_id: "item_keychain", quantity: 2 },
        ] as any
      }
    />
  )

  fireEvent.mouseEnter(screen.getByText("Exchange"))
}

describe("ActivityItems", () => {
  it("names a product's one variant by the product alone", () => {
    renderOpen()

    expect(screen.getAllByText("Llavero de cuero")).toHaveLength(2)
    expect(screen.queryByText(/Default variant/)).toBeNull()
  })

  it("keeps the variant's title next to the product's", () => {
    renderOpen()

    expect(screen.getByText("M / Negro · Remera")).toBeTruthy()
  })
})
