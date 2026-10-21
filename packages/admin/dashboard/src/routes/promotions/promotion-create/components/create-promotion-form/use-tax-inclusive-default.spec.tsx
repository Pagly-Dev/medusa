// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useTaxInclusiveDefault } from "./use-tax-inclusive-default"

const preferences = vi.hoisted(() => ({
  rows: [
    { attribute: "currency_code", value: "uyu", is_tax_inclusive: true },
    { attribute: "currency_code", value: "usd", is_tax_inclusive: false },
  ],
}))

vi.mock("../../../../../hooks/api/price-preferences", () => ({
  usePricePreferences: (query: { value?: string[] }) => ({
    price_preferences: preferences.rows.filter((row) =>
      query?.value?.includes(row.value)
    ),
  }),
}))

afterEach(() => {
  cleanup()
})

type Values = {
  is_tax_inclusive: boolean
  application_method: { currency_code?: string }
}

const setup = (enabled = true) =>
  renderHook(
    ({ enabled }) => {
      const form = useForm<Values>({
        defaultValues: { is_tax_inclusive: false, application_method: {} },
      })
      useTaxInclusiveDefault(form as any, enabled)
      return form
    },
    { initialProps: { enabled } }
  )

// QA F3: an amount off made in a store whose prices include IVA took the
// amount off before tax, 22% more than it said.
describe("useTaxInclusiveDefault", () => {
  it("includes tax in an amount where the currency's prices include it", () => {
    const { result } = setup()

    act(() => result.current.setValue("application_method.currency_code", "uyu"))

    expect(result.current.getValues("is_tax_inclusive")).toBe(true)
  })

  it("leaves tax out where the currency's prices leave it out", () => {
    const { result } = setup()

    act(() => result.current.setValue("application_method.currency_code", "uyu"))
    act(() => result.current.setValue("application_method.currency_code", "usd"))

    expect(result.current.getValues("is_tax_inclusive")).toBe(false)
  })

  it("keeps what the merchant chose, even the default", () => {
    const { result } = setup()

    // A click on the switch, then away from it.
    act(() =>
      result.current.setValue("is_tax_inclusive", false, {
        shouldDirty: true,
        shouldTouch: true,
      })
    )
    act(() => result.current.setValue("application_method.currency_code", "uyu"))

    expect(result.current.getValues("is_tax_inclusive")).toBe(false)
  })

  it("does nothing for a promotion without an amount", () => {
    const { result } = setup(false)

    act(() => result.current.setValue("application_method.currency_code", "uyu"))

    expect(result.current.getValues("is_tax_inclusive")).toBe(false)
  })
})
