// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  draftOrder,
  mugItem,
  pageText,
  shirtItem,
} from "../../../__tests__/fixtures/one-version-items"
import { SummarySection } from "../summary-section"

vi.mock("../../../hooks/api/draft-orders", () => ({
  useConvertDraftOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

afterEach(() => {
  cleanup()
})

const renderSummary = (items: unknown[]) =>
  render(
    <MemoryRouter>
      <SummarySection order={draftOrder({ items })} />
    </MemoryRouter>
  )

describe("SummarySection", () => {
  it("names a product's one version by the product alone", () => {
    renderSummary([mugItem])

    expect(screen.getByText("Taza de cerámica hecha a mano")).toBeTruthy()
    expect(pageText()).not.toContain("Default variant")
  })

  it("keeps a real variant's title next to its product", () => {
    renderSummary([mugItem, shirtItem])

    expect(screen.getByText("Remera")).toBeTruthy()
    expect(screen.getByText("(M / Negro)")).toBeTruthy()
    expect(pageText()).not.toContain("Default variant")
  })

  it("matches the default title in any case", () => {
    renderSummary([{ ...mugItem, variant_title: "default" }])

    expect(screen.getByText("Taza de cerámica hecha a mano")).toBeTruthy()
    expect(screen.queryByText("(default)")).toBeNull()
  })
})
