// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.hoisted(() => {
  const g = global as any
  g.__MAX_UPLOAD_FILE_SIZE__ = undefined
})

import { FileUpload } from "../file-upload"

const png = () =>
  new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "photo.png", {
    type: "image/png",
  })

let inputClick: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  inputClick = vi.spyOn(HTMLInputElement.prototype, "click")
  URL.createObjectURL = vi.fn(() => "blob:preview")
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("FileUpload", () => {
  it("opens the file dialog on click by default", async () => {
    const user = userEvent.setup()
    render(
      <FileUpload label="Upload" formats={["image/png"]} onUploaded={vi.fn()} />
    )

    await user.click(screen.getByRole("button", { name: "Upload" }))

    expect(inputClick).toHaveBeenCalled()
  })

  it("lets the caller decide what a click opens", async () => {
    const user = userEvent.setup()
    const onBrowse = vi.fn()
    render(
      <FileUpload
        label="Upload"
        formats={["image/png"]}
        onUploaded={vi.fn()}
        onBrowse={onBrowse}
      />
    )

    await user.click(screen.getByRole("button", { name: "Upload" }))

    expect(onBrowse).toHaveBeenCalledTimes(1)
    expect(inputClick).not.toHaveBeenCalled()
  })

  it("still takes dropped files when the caller decides what a click opens", () => {
    const onUploaded = vi.fn()
    const file = png()
    render(
      <FileUpload
        label="Upload"
        formats={["image/png"]}
        onUploaded={onUploaded}
        onBrowse={vi.fn()}
      />
    )

    fireEvent.drop(screen.getByRole("button", { name: "Upload" }), {
      dataTransfer: { files: [file] },
    })

    expect(onUploaded).toHaveBeenCalledWith(
      [{ id: expect.any(String), url: "blob:preview", file }],
      []
    )
  })
})
