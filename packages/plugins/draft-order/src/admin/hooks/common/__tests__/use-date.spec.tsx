// @vitest-environment jsdom
import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useDate } from "../use-date"

describe("useDate", () => {
  it("keeps its formatters between renders, so memos that use them hold", () => {
    const { result, rerender } = renderHook(() => useDate())
    const first = result.current

    rerender()

    expect(result.current.getFullDate).toBe(first.getFullDate)
    expect(result.current.getRelativeDate).toBe(first.getRelativeDate)
  })
})
