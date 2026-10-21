// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ManageVariantInventoryItemsForm } from "../components/manage-variant-inventory-items-form"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock("../../../../components/modals", async () => {
  const { FormProvider } = await import("react-hook-form")
  const Pass = ({ children }: { children?: ReactNode }) => <>{children}</>

  return {
    RouteFocusModal: Object.assign(Pass, {
      Form: ({ form, children }: { form: any; children?: ReactNode }) => (
        <FormProvider {...form}>{children}</FormProvider>
      ),
      Header: Pass,
      Body: Pass,
      Footer: Pass,
      Close: Pass,
    }),
    useRouteModal: () => ({ handleSuccess: vi.fn() }),
  }
})

vi.mock("../../../../components/inputs/combobox", () => ({
  Combobox: () => null,
}))

vi.mock("../../../../hooks/use-combobox-data", () => ({
  useComboboxData: () => ({ options: [] }),
}))

vi.mock("../../../../lib/client", () => ({ sdk: {} }))

vi.mock("../../../../hooks/api/products", () => ({
  useProductVariantsInventoryItemsBatch: () => ({ mutateAsync: vi.fn() }),
}))

afterEach(() => {
  cleanup()
})

const variant = (title: string) =>
  ({
    id: "variant_1",
    product_id: "prod_1",
    title,
    product: { id: "prod_1", title: "Taza de cerámica" },
    inventory_items: [],
  } as any)

describe("ManageVariantInventoryItemsForm", () => {
  it("labels a product's one version with the product's title", () => {
    render(
      <ManageVariantInventoryItemsForm variant={variant("Default variant")} />
    )

    expect(screen.getByText("Taza de cerámica")).toBeTruthy()
    expect(screen.queryByText(/Default variant/)).toBeNull()
  })

  it("keeps a variant's own title", () => {
    render(<ManageVariantInventoryItemsForm variant={variant("M / Negro")} />)

    expect(screen.getByText("M / Negro")).toBeTruthy()
  })
})
