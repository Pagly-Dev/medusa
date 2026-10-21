// @vitest-environment jsdom
import { TooltipProvider } from "@medusajs/ui"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { inSpanish } from "../../../../__tests__/fixtures/i18n"
import Create from "../page"

vi.mock("../../../../components/modals", async () =>
  (await import("../../../../__tests__/fixtures/modals")).modalsMock()
)

vi.mock("../../../../hooks/api/draft-orders", () => ({
  useCreateDraftOrder: () => ({
    mutateAsync: () => Promise.resolve(),
    isPending: false,
  }),
}))

vi.mock("../../../../hooks/api/customers", () => ({
  useCustomer: () => ({ customer: undefined }),
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

beforeAll(() => {
  // jsdom has no IntersectionObserver or ResizeObserver; the comboboxes watch
  // their last option and the switch measures itself.
  const Observer = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.IntersectionObserver ??=
    Observer as unknown as typeof IntersectionObserver
  globalThis.ResizeObserver ??= Observer as unknown as typeof ResizeObserver
})

afterEach(() => {
  cleanup()
})

const renderCreate = () =>
  render(
    <MemoryRouter>
      <TooltipProvider>
        <Create />
      </TooltipProvider>
    </MemoryRouter>
  )

describe("Create draft order in Spanish", () => {
  inSpanish()

  it("labels the order's details", () => {
    renderCreate()

    expect(screen.getByText("Crear pedido borrador")).toBeTruthy()
    for (const text of [
      "Región",
      "Elegí la región",
      "Canal de venta",
      "Elegí el canal de venta",
      "Cliente",
      "Elegí un cliente existente",
      "Correo electrónico",
      "Ingresá un correo electrónico para asociar al pedido",
    ]) {
      expect(screen.getByText(text)).toBeTruthy()
    }
    for (const placeholder of [
      "Seleccioná una región",
      "Seleccioná un canal de venta",
      "Seleccioná un cliente",
      "nombre@ejemplo.com",
    ]) {
      expect(screen.getByPlaceholderText(placeholder)).toBeTruthy()
    }
    expect(screen.getAllByText("(Opcional)").length).toBeGreaterThan(0)
  })

  it("labels the addresses", () => {
    renderCreate()

    for (const text of [
      "Dirección de envío",
      "Dirección para el envío",
      "Dirección de facturación",
      "Dirección para la facturación",
      "Misma que la dirección de envío",
      "Usá la misma dirección para facturación y envío",
      "Provincia / Estado",
    ]) {
      expect(screen.getByText(text)).toBeTruthy()
    }
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Guardar" })).toBeTruthy()
  })

  it("explains what is missing", async () => {
    renderCreate()
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }))

    expect(
      await screen.findByText("Se requiere un correo electrónico o un cliente.")
    ).toBeTruthy()
    expect(
      screen.getAllByText("Este campo es obligatorio.").length
    ).toBeGreaterThan(0)
  })
})
