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
  pageText,
  shippingOption,
} from "../../../../../__tests__/fixtures/one-version-items"
import Shipping from "../page"

const state = vi.hoisted(() => ({
  shippingMethods: [] as unknown[],
  shippingOptions: [] as unknown[],
}))

const mutation = vi.hoisted(() => () => ({
  mutateAsync: () => Promise.resolve(),
  isPending: false,
}))

vi.mock("../../../../../components/modals", async () =>
  (await import("../../../../../__tests__/fixtures/modals")).modalsMock()
)

vi.mock("../../../../../hooks/api/draft-orders", () => ({
  useDraftOrderAddShippingMethod: mutation,
  useDraftOrderConfirmEdit: mutation,
  useDraftOrderRemoveActionShippingMethod: mutation,
  useDraftOrderRemoveShippingMethod: mutation,
  useDraftOrderRequestEdit: mutation,
  useDraftOrderUpdateShippingMethod: mutation,
}))

vi.mock("../../../../../hooks/api/orders", async () => {
  const { draftOrder } = await import(
    "../../../../../__tests__/fixtures/one-version-items"
  )

  return {
    useOrder: () => ({
      order: draftOrder(),
      isPending: false,
      isError: false,
    }),
    useOrderPreview: () => ({
      order: draftOrder({ shipping_methods: state.shippingMethods }),
      isPending: false,
      isError: false,
    }),
  }
})

vi.mock("../../../../../hooks/api/shipping-options", () => ({
  useShippingOptions: () => ({ shipping_options: state.shippingOptions }),
}))

vi.mock("../../../../../hooks/common/use-combobox-data", () => ({
  useComboboxData: () => ({
    options: [],
    searchValue: "",
    onSearchValueChange: () => {},
    fetchNextPage: () => {},
    isFetchingNextPage: false,
    disabled: false,
  }),
}))

vi.mock("../../../../../lib/queries/sdk", () => ({ sdk: {} }))

vi.mock("../../../../../hooks/order-edits/use-cancel-order-edit", () => ({
  useCancelOrderEdit: () => ({ onCancel: () => {} }),
}))

vi.mock("../../../../../hooks/order-edits/use-initiate-order-edit", () => ({
  useInitiateOrderEdit: () => {},
}))

beforeAll(() => {
  // jsdom has no IntersectionObserver; the comboboxes watch their last option.
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver
})

afterEach(() => {
  cleanup()
  state.shippingMethods = []
  state.shippingOptions = []
})

const renderShipping = () =>
  render(
    <MemoryRouter>
      <TooltipProvider>
        <Shipping />
      </TooltipProvider>
    </MemoryRouter>
  )

/** Opens the shipping profile's row to list its items. */
const expandProfile = () => {
  const [trigger] = screen
    .getAllByRole("button")
    .filter((button) => button.getAttribute("aria-expanded") === "false")
  fireEvent.click(trigger)
}

const shipWithMoto = () => {
  state.shippingMethods = [
    {
      id: "sm_moto",
      shipping_option_id: shippingOption.id,
      actions: [],
    },
  ]
  state.shippingOptions = [shippingOption]
}

describe("Edit shipping", () => {
  it("lists a product's one version by the product alone", () => {
    renderShipping()
    expandProfile()

    expect(screen.getByText("Taza de cerámica hecha a mano")).toBeTruthy()
    expect(screen.getByText("Remera (M / Negro)")).toBeTruthy()
    expect(pageText()).not.toContain("Default variant")
  })

  it("leaves out the default option's value", () => {
    renderShipping()
    expandProfile()

    expect(screen.getByText("M · Negro")).toBeTruthy()
    expect(pageText()).not.toContain("Default option value")
  })

  it("lists the items on the badge's tooltip without the default title", async () => {
    shipWithMoto()
    renderShipping()

    fireEvent.focusIn(screen.getByText(/3x items/))
    const tooltip = await screen.findByRole("tooltip")

    expect(
      within(tooltip).getByText("2x Taza de cerámica hecha a mano")
    ).toBeTruthy()
    expect(within(tooltip).getByText("1x Remera (M / Negro)")).toBeTruthy()
  })

  it("shows the items to ship without the default title", () => {
    renderShipping()

    fireEvent.click(screen.getByRole("button", { name: "Add shipping option" }))

    expect(screen.getByText("Items to ship")).toBeTruthy()
    expect(screen.getByText("Taza de cerámica hecha a mano")).toBeTruthy()
    expect(screen.getByText("(M / Negro)")).toBeTruthy()
    expect(pageText()).not.toContain("Default variant")
  })
})
