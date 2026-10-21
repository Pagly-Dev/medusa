// @vitest-environment jsdom
import { TooltipProvider } from "@medusajs/ui"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import { inSpanish } from "../../../__tests__/fixtures/i18n"
import { openActionMenu } from "../../../__tests__/fixtures/menus"
import { pageText } from "../../../__tests__/fixtures/one-version-items"
import { ActiveOrderChange } from "../active-order-changes"
import { ActivitySection } from "../activity-section"
import { CustomerSection } from "../customer-section"
import { GeneralSection } from "../general-section"
import { JsonViewSection } from "../json-view-section"
import { MetadataSection } from "../metadata-section"

const preview = vi.hoisted(() => ({ actions: [] as unknown[] }))
const deleteDraftOrder = vi.hoisted(() => vi.fn(() => Promise.resolve()))

vi.mock("../../../hooks/api/regions", () => ({
  useRegion: () => ({
    region: { id: "reg_uy", name: "Uruguay" },
    isPending: false,
    isError: false,
  }),
}))

vi.mock("../../../hooks/api/users", () => ({
  useUser: () => ({
    user: { id: "user_1", first_name: "Ana", last_name: "Admin" },
    isPending: false,
    isError: false,
  }),
}))

vi.mock("../../../hooks/api/draft-orders", () => ({
  useDeleteDraftOrder: () => ({
    mutateAsync: deleteDraftOrder,
    isPending: false,
  }),
  useDraftOrderCancelEdit: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock("../../../hooks/api/orders", () => ({
  useOrderPreview: () => ({
    order: { order_change: { status: "pending", actions: preview.actions } },
  }),
}))

afterEach(() => {
  cleanup()
  preview.actions = []
  deleteDraftOrder.mockClear()
})

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

const address = {
  first_name: "Ana",
  last_name: "Pérez",
  address_1: "Av. Paulista 1000",
  city: "São Paulo",
  postal_code: "01310-100",
  country_code: "br",
  phone: "+55 11 5555 5555",
}

const order = {
  id: "order_draft",
  display_id: 4,
  region_id: "reg_uy",
  created_at: daysAgo(5),
  sales_channel: { name: "Tienda online" },
  customer_id: "cus_1",
  email: "ana@ejemplo.com",
  customer: { first_name: "Ana", last_name: "Pérez" },
  shipping_address: address,
  billing_address: address,
  metadata: { origen: "whatsapp", campana: "primavera" },
} as any

const renderInRouter = (node: ReactNode, path = "/draft-orders/order_draft") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <TooltipProvider>{node}</TooltipProvider>
    </MemoryRouter>
  )

describe("Draft order page sections in Spanish", () => {
  inSpanish()

  describe("GeneralSection", () => {
    it("titles the draft and says where it came from", () => {
      renderInRouter(<GeneralSection order={order} />)

      expect(screen.getByText("Pedido borrador #4")).toBeTruthy()
      expect(screen.getByText(/ desde Tienda online$/)).toBeTruthy()
    })

    it("asks before deleting the draft", async () => {
      renderInRouter(<GeneralSection order={order} />)
      openActionMenu()
      fireEvent.click(
        screen.getByRole("menuitem", { name: "Eliminar pedido borrador" })
      )

      expect(await screen.findByText("¿Estás seguro?")).toBeTruthy()
      expect(screen.getByText(/pedido borrador #4/)).toBeTruthy()
      expect(deleteDraftOrder).not.toHaveBeenCalled()
    })

    it("names the menu's actions", () => {
      renderInRouter(<GeneralSection order={order} />)
      openActionMenu()

      expect(
        screen.getByRole("menuitem", { name: "Editar canal de venta" })
      ).toBeTruthy()
      expect(
        screen.getByRole("menuitem", { name: "Eliminar pedido borrador" })
      ).toBeTruthy()
    })
  })

  describe("CustomerSection", () => {
    it("labels the customer's details", () => {
      renderInRouter(<CustomerSection order={order} />)

      for (const label of [
        "Cliente",
        "ID",
        "Contacto",
        "Dirección de envío",
        "Dirección de facturación",
        "Misma que la dirección de envío",
      ]) {
        expect(screen.getByText(label)).toBeTruthy()
      }
    })

    it("names the address's country in Spanish", () => {
      renderInRouter(<CustomerSection order={order} />)

      expect(pageText()).toContain("Brasil")
      expect(pageText()).not.toContain("Brazil")
    })

    it("names the menu's actions", () => {
      renderInRouter(<CustomerSection order={order} />)
      openActionMenu()

      for (const action of [
        "Transferir propiedad",
        "Editar dirección de envío",
        "Editar dirección de facturación",
        "Editar correo electrónico",
      ]) {
        expect(screen.getByRole("menuitem", { name: action })).toBeTruthy()
      }
    })
  })

  describe("ActivitySection", () => {
    const changes = [
      {
        id: "ch_edit",
        change_type: "edit",
        created_at: daysAgo(4),
        confirmed_at: daysAgo(4),
        confirmed_by: "user_1",
        actions: [
          { action: "ITEM_ADD", ordering: 1, details: { quantity: 2 } },
          {
            action: "PROMOTION_ADD",
            ordering: 2,
            reference_id: "promo_1",
            details: {},
          },
        ],
      },
      {
        id: "ch_email",
        change_type: "update_order",
        created_at: daysAgo(3),
        confirmed_at: daysAgo(3),
        confirmed_by: "user_1",
        actions: [{ details: { type: "email" } }],
      },
      {
        id: "ch_transfer",
        change_type: "transfer",
        created_at: daysAgo(2),
        confirmed_at: daysAgo(2),
        actions: [],
      },
    ] as any

    it("names each event", () => {
      renderInRouter(<ActivitySection order={order} changes={changes} />)

      expect(screen.getByText("Actividad")).toBeTruthy()
      expect(screen.getByText("Transferido")).toBeTruthy()
      expect(screen.getByText("Pedido borrador transferido")).toBeTruthy()
      expect(screen.getByText("Correo electrónico actualizado")).toBeTruthy()
      expect(screen.getByText("Creado")).toBeTruthy()
      expect(screen.getByText("Pedido borrador creado")).toBeTruthy()
      expect(screen.getByText("hace 2 días")).toBeTruthy()
      expect(screen.getByText("Por")).toBeTruthy()
    })

    it("folds older events and counts them", () => {
      renderInRouter(<ActivitySection order={order} changes={changes} />)
      fireEvent.click(screen.getByText("Mostrar 2 actividades más"))

      expect(screen.getByText("Artículos agregados")).toBeTruthy()
      expect(screen.getByText("2 artículos agregados")).toBeTruthy()
      expect(screen.getByText("Promociones agregadas")).toBeTruthy()
      expect(screen.getByText("1 promoción agregada")).toBeTruthy()
    })
  })

  describe("MetadataSection", () => {
    it("counts the keys", () => {
      renderInRouter(<MetadataSection order={order} />)

      expect(screen.getByText("Metadatos")).toBeTruthy()
      expect(screen.getByText("2 claves")).toBeTruthy()
    })
  })

  describe("JsonViewSection", () => {
    it("counts the keys", () => {
      renderInRouter(<JsonViewSection data={{ id: "order_draft" }} />)

      expect(screen.getByText("JSON")).toBeTruthy()
      expect(screen.getByText("1 clave")).toBeTruthy()
    })
  })

  describe("ActiveOrderChange", () => {
    it("explains an edit with no changes yet", () => {
      renderInRouter(<ActiveOrderChange orderId="order_draft" />)

      expect(screen.getByText("Edición pendiente")).toBeTruthy()
      expect(
        screen.getByText(
          "Este pedido borrador tiene una edición pendiente sin cambios. Cancelala abajo o abrí uno de los menús para empezar a editar."
        )
      ).toBeTruthy()
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy()
    })

    it("explains an edit with changes", () => {
      preview.actions = [{ action: "ITEM_ADD" }]
      renderInRouter(<ActiveOrderChange orderId="order_draft" />)

      expect(
        screen.getByText(
          "Este pedido borrador tiene una edición pendiente con cambios. Cancelala abajo o seguí para completar la edición."
        )
      ).toBeTruthy()
      expect(screen.getByRole("button", { name: "Continuar" })).toBeTruthy()
    })
  })
})

describe("ActivitySection in English", () => {
  it("lists what an edit added and removed in one sentence", () => {
    const edit = {
      id: "ch_edit",
      change_type: "edit",
      created_at: daysAgo(1),
      confirmed_at: daysAgo(1),
      actions: [
        { action: "ITEM_ADD", ordering: 1, details: { quantity: 2 } },
        { action: "ITEM_UPDATE", ordering: 2, details: { quantity_diff: -1 } },
      ],
    } as any
    renderInRouter(<ActivitySection order={order} changes={[edit]} />)

    expect(screen.getByText("Items updated")).toBeTruthy()
    expect(screen.getByText("2 items added, 1 item removed")).toBeTruthy()
  })
})
