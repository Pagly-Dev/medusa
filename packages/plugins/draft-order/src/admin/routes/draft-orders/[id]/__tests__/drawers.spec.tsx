// @vitest-environment jsdom
import { TooltipProvider } from "@medusajs/ui"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { ComponentType } from "react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { inSpanish } from "../../../../__tests__/fixtures/i18n"
import BillingAddress from "../@billing-address/page"
import CustomItems from "../@custom-items/page"
import Email from "../@email/page"
import Metadata from "../@metadata/page"
import Promotions from "../@promotions/page"
import SalesChannel from "../@sales-channel/page"
import ShippingAddress from "../@shipping-address/page"
import TransferOwnership from "../@transfer-ownership/page"

const state = vi.hoisted(() => ({ order: {} as Record<string, unknown> }))

const mutation = vi.hoisted(() => () => ({
  mutateAsync: () => Promise.resolve(),
  isPending: false,
}))

vi.mock("../../../../components/modals", async () =>
  (await import("../../../../__tests__/fixtures/modals")).modalsMock()
)

vi.mock("../../../../hooks/api/draft-orders", () => ({
  useDraftOrder: () => ({
    draft_order: state.order,
    isPending: false,
    isError: false,
  }),
  useUpdateDraftOrder: mutation,
  useDraftOrderAddPromotions: mutation,
  useDraftOrderConfirmEdit: mutation,
  useDraftOrderRemovePromotions: mutation,
}))

vi.mock("../../../../hooks/api/orders", () => ({
  useOrder: () => ({ order: state.order, isPending: false, isError: false }),
  useOrderPreview: () => ({
    order: { id: "order_draft", items: [], shipping_methods: [] },
    isPending: false,
    isError: false,
  }),
  useOrderEditRequest: mutation,
}))

vi.mock("../../../../hooks/api/promotions", () => ({
  usePromotions: () => ({ promotions: [], isPending: false, isError: false }),
}))

vi.mock("../../../../hooks/common/use-combobox-data", () => ({
  useComboboxData: () => ({
    options: [],
    searchValue: "",
    onSearchValueChange: () => {},
    fetchNextPage: () => {},
    isFetchingNextPage: false,
    disabled: false,
  }),
}))

vi.mock("../../../../lib/queries/sdk", () => ({ sdk: {} }))

vi.mock("../../../../hooks/order-edits/use-cancel-order-edit", () => ({
  useCancelOrderEdit: () => ({ onCancel: () => {} }),
}))

vi.mock("../../../../hooks/order-edits/use-initiate-order-edit", () => ({
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
  state.order = {}
})

const address = {
  first_name: "Ana",
  last_name: "Pérez",
  address_1: "Av. Brasil 2500",
  city: "Montevideo",
  postal_code: "11300",
  country_code: "uy",
  phone: "099 123 456",
}

const customer = {
  id: "cus_1",
  email: "ana@ejemplo.com",
  first_name: "Ana",
  last_name: "Pérez",
}

const renderRoute = (Page: ComponentType, order: Record<string, unknown>) => {
  state.order = { id: "order_draft", ...order }
  return render(
    <MemoryRouter initialEntries={["/draft-orders/order_draft"]}>
      <TooltipProvider>
        <Routes>
          <Route path="/draft-orders/:id" element={<Page />} />
        </Routes>
      </TooltipProvider>
    </MemoryRouter>
  )
}

const expectFooter = () => {
  expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy()
  expect(screen.getByRole("button", { name: "Guardar" })).toBeTruthy()
}

const ADDRESS_LABELS = [
  "País",
  "Nombre",
  "Apellido",
  "Empresa",
  "Dirección",
  "Apartamento, suite, etc.",
  "Código postal",
  "Ciudad",
  "Provincia / Estado",
  "Teléfono",
]

describe("Draft order drawers in Spanish", () => {
  inSpanish()

  it("labels the email form and its validation", async () => {
    renderRoute(Email, { email: "no es un correo" })

    expect(screen.getByText("Editar correo electrónico")).toBeTruthy()
    expect(screen.getByText("Correo electrónico")).toBeTruthy()
    expectFooter()

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }))
    expect(
      await screen.findByText(
        "El correo electrónico debe ser una dirección de correo válida."
      )
    ).toBeTruthy()
  })

  it("labels the billing address form", () => {
    renderRoute(BillingAddress, { billing_address: address })

    expect(screen.getByText("Editar dirección de facturación")).toBeTruthy()
    for (const label of ADDRESS_LABELS) {
      expect(screen.getByText(label)).toBeTruthy()
    }
    expectFooter()
  })

  it("lists countries by their Spanish names", () => {
    renderRoute(BillingAddress, { billing_address: address })

    expect(screen.getByRole("option", { name: "Brasil" })).toBeTruthy()
    expect(screen.queryByRole("option", { name: "Brazil" })).toBeNull()
    expect(
      screen.getByRole("option", { name: "Seleccionar país" })
    ).toBeTruthy()
  })

  it("labels the shipping address form and its required fields", async () => {
    renderRoute(ShippingAddress, { shipping_address: null })

    expect(screen.getByText("Editar dirección de envío")).toBeTruthy()
    for (const label of ADDRESS_LABELS) {
      expect(screen.getByText(label)).toBeTruthy()
    }
    expectFooter()

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }))
    expect(
      (await screen.findAllByText("Este campo es obligatorio.")).length
    ).toBeGreaterThan(0)
  })

  it("labels the sales channel form", () => {
    renderRoute(SalesChannel, { sales_channel_id: "sc_1" })

    expect(screen.getByText("Editar canal de venta")).toBeTruthy()
    expect(screen.getByText("Canal de venta")).toBeTruthy()
    expect(
      screen.getByPlaceholderText("Seleccioná un canal de venta")
    ).toBeTruthy()
    expectFooter()
  })

  it("labels the transfer ownership form", () => {
    renderRoute(TransferOwnership, { customer_id: customer.id, customer })

    expect(screen.getByText("Transferir propiedad")).toBeTruthy()
    expect(screen.getByText("Propietario actual")).toBeTruthy()
    expect(
      screen.getByText("El cliente asociado hoy a este pedido borrador.")
    ).toBeTruthy()
    expect(screen.getByText("Nuevo cliente")).toBeTruthy()
    expect(
      screen.getByText("El cliente al que se transfiere este pedido borrador.")
    ).toBeTruthy()
    expect(screen.getByPlaceholderText("Seleccioná un cliente")).toBeTruthy()
    expectFooter()
  })

  it("labels the metadata form", () => {
    renderRoute(Metadata, { metadata: { origen: "whatsapp" } })

    expect(screen.getByText("Metadatos")).toBeTruthy()
    expect(screen.getByText("Clave")).toBeTruthy()
    expect(screen.getByText("Valor")).toBeTruthy()
    expectFooter()
  })

  it("labels the custom items form", () => {
    renderRoute(CustomItems, {})

    expect(screen.getByText("Editar artículos personalizados")).toBeTruthy()
    expectFooter()
  })

  it("labels the promotions form", () => {
    renderRoute(Promotions, {})

    expect(screen.getByText("Editar promociones")).toBeTruthy()
    expect(screen.getByText("Aplicar promociones")).toBeTruthy()
    expect(
      screen.getByText("Gestioná las promociones que se aplican al pedido.")
    ).toBeTruthy()
    expectFooter()
  })
})
