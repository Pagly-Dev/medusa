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
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  draftOrder,
  mugItem,
  pageText,
  shippingOption,
} from "../../../__tests__/fixtures/one-version-items"
import { inSpanish } from "../../../__tests__/fixtures/i18n"
import { ShippingSection } from "../shipping-section"

const shippingOptions = vi.hoisted(() => ({ current: [] as unknown[] }))

vi.mock("../../../hooks/api/shipping-options", () => ({
  useShippingOptions: () => ({
    shipping_options: shippingOptions.current,
    isPending: false,
    isError: false,
    error: null,
  }),
}))

afterEach(() => {
  cleanup()
  shippingOptions.current = []
})

const renderShipping = (order: unknown) =>
  render(
    <MemoryRouter>
      <TooltipProvider>
        <ShippingSection order={order as any} />
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

describe("ShippingSection", () => {
  describe("a profile with no shipping method yet", () => {
    it("lists a product's one version by the product alone", () => {
      renderShipping(draftOrder({ items: [mugItem] }))
      expandProfile()

      expect(screen.getByText("Taza de cerámica hecha a mano")).toBeTruthy()
      expect(pageText()).not.toContain("Default variant")
    })

    it("leaves out the default option's value", () => {
      renderShipping(draftOrder({ items: [mugItem] }))
      expandProfile()

      expect(pageText()).not.toContain("Default option value")
    })

    it("keeps a real variant's title and values", () => {
      renderShipping(draftOrder())
      expandProfile()

      expect(screen.getByText("Remera (M / Negro)")).toBeTruthy()
      expect(screen.getByText("M · Negro")).toBeTruthy()
      expect(pageText()).not.toContain("Default variant")
    })
  })

  describe("a profile shipped by a method", () => {
    const shippedOrder = () =>
      draftOrder({
        shipping_methods: [
          { id: "sm_1", shipping_option_id: shippingOption.id },
        ],
      })

    it("lists the items on the badge's tooltip without the default title", async () => {
      shippingOptions.current = [shippingOption]
      renderShipping(shippedOrder())

      fireEvent.focusIn(screen.getByText(/3x items/))
      const tooltip = await screen.findByRole("tooltip")

      expect(
        within(tooltip).getByText("2x Taza de cerámica hecha a mano")
      ).toBeTruthy()
      expect(within(tooltip).getByText("1x Remera (M / Negro)")).toBeTruthy()
      expect(pageText()).not.toContain("Default variant")
    })

    it("lists a product's one version by the product alone", () => {
      shippingOptions.current = [shippingOption]
      renderShipping(shippedOrder())
      expandProfile()

      expect(screen.getByText("Taza de cerámica hecha a mano")).toBeTruthy()
      expect(pageText()).not.toContain("Default variant")
      expect(pageText()).not.toContain("Default option value")
    })
  })
})

describe("ShippingSection in Spanish", () => {
  inSpanish()

  it("labels a profile that still needs shipping", () => {
    renderShipping(draftOrder())

    expect(screen.getByText("Envío")).toBeTruthy()
    expect(screen.getByText("Requiere envío")).toBeTruthy()
    expect(screen.getByText("2 artículos")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Agregar envío" })).toBeTruthy()
  })

  it("counts a shipped profile's units", () => {
    shippingOptions.current = [shippingOption]
    renderShipping(
      draftOrder({
        shipping_methods: [
          { id: "sm_1", shipping_option_id: shippingOption.id },
        ],
      })
    )

    expect(screen.getByText("3 artículos")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Editar envío" })).toBeTruthy()
  })
})
