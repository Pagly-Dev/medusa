// @vitest-environment jsdom
import { TooltipProvider } from "@medusajs/ui"
import { cleanup, render, screen } from "@testing-library/react"
import { ReactNode } from "react"
import { useForm } from "react-hook-form"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Form } from "../../../../components/common/form"
import { ClaimOutboundItem } from "../../order-create-claim/components/claim-create-form/claim-outbound-item"
import { OrderEditItem } from "../../order-create-edit/components/order-edit-create-form/order-edit-item"
import { ExchangeOutboundItem } from "../../order-create-exchange/components/exchange-create-form/exchange-outbound-item"
import { OrderCreateFulfillmentItem } from "../../order-create-fulfillment/components/order-create-fulfillment-form/order-create-fulfillment-item"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock("../../../../hooks/api/order-edits", () => ({
  useAddOrderEditItems: () => ({ mutateAsync: vi.fn() }),
  useRemoveOrderEditItem: () => ({ mutateAsync: vi.fn() }),
  useUpdateOrderEditAddedItem: () => ({ mutateAsync: vi.fn() }),
  useUpdateOrderEditOriginalItem: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock("../../../../hooks/api/products", () => ({
  useProductVariant: () => ({ variant: undefined }),
}))

afterEach(() => {
  cleanup()
})

const lineItem = (variantTitle: string, productTitle: string) =>
  ({
    id: `item_${productTitle}`,
    title: productTitle,
    subtitle: variantTitle,
    product_title: productTitle,
    variant_title: variantTitle,
    variant_sku: null,
    thumbnail: null,
    quantity: 1,
    unit_price: 1200,
    total: 1200,
    detail: { fulfilled_quantity: 0 },
    actions: [],
    adjustments: [],
  } as any)

const keychain = lineItem("Default variant", "Llavero de cuero")
const shirt = lineItem("M / Negro", "Remera")

const WithForm = ({ children }: { children: (form: any) => ReactNode }) => {
  const form = useForm({
    defaultValues: {
      outbound_items: [{ quantity: 1 }],
      quantity: { [keychain.id]: 1, [shirt.id]: 1 },
    },
  })

  return (
    <MemoryRouter>
      <TooltipProvider>
        <Form {...form}>{children(form)}</Form>
      </TooltipProvider>
    </MemoryRouter>
  )
}

const screens = {
  "a claim's item to send": (item: any) => (
    <WithForm>
      {(form) => (
        <ClaimOutboundItem
          previewItem={item}
          currencyCode="uyu"
          index={0}
          form={form}
          onRemove={vi.fn()}
          onUpdate={vi.fn()}
        />
      )}
    </WithForm>
  ),
  "an exchange's item to send": (item: any) => (
    <WithForm>
      {(form) => (
        <ExchangeOutboundItem
          previewItem={item}
          currencyCode="uyu"
          index={0}
          form={form}
          onRemove={vi.fn()}
          onUpdate={vi.fn()}
        />
      )}
    </WithForm>
  ),
  "an order edit's item": (item: any) => (
    <WithForm>
      {() => <OrderEditItem item={item} currencyCode="uyu" orderId="order_1" />}
    </WithForm>
  ),
  "a fulfillment's item": (item: any) => (
    <WithForm>
      {(form) => (
        <OrderCreateFulfillmentItem
          item={item}
          form={form}
          reservations={[]}
          disabled={false}
        />
      )}
    </WithForm>
  ),
}

describe.each(Object.entries(screens))("%s", (_, renderItem) => {
  it("names a product's one variant by the product alone", () => {
    render(renderItem(keychain))

    expect(screen.getAllByText("Llavero de cuero").length).toBeGreaterThan(0)
    expect(screen.queryByText(/Default variant/)).toBeNull()
  })

  it("keeps a variant's own title under the product's", () => {
    render(renderItem(shirt))

    expect(screen.getAllByText("Remera").length).toBeGreaterThan(0)
    expect(screen.getByText("M / Negro")).toBeTruthy()
  })
})
