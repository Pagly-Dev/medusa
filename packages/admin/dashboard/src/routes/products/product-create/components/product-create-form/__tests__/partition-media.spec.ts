import { describe, expect, it } from "vitest"

import { partitionMediaForUpload } from "../../../utils"

const file = (name: string) => new File(["x"], name, { type: "image/png" })

describe("partitionMediaForUpload", () => {
  it("uploads entries that carry a file, the thumbnail apart from the rest", () => {
    const thumb = { url: "blob:1", isThumbnail: true, file: file("t.png") }
    const other = { url: "blob:2", isThumbnail: false, file: file("o.png") }

    expect(partitionMediaForUpload([other, thumb])).toEqual({
      thumbnail: thumb,
      others: [other],
      stored: [],
    })
  })

  it("passes entries picked from the media library through as they are", () => {
    const picked = {
      url: "http://localhost:9000/static/1-a.png",
      isThumbnail: false,
      file: null,
    }

    expect(partitionMediaForUpload([picked])).toEqual({
      thumbnail: undefined,
      others: [],
      stored: [{ url: picked.url, isThumbnail: false }],
    })
  })

  it("keeps a picked thumbnail as the thumbnail", () => {
    const pickedThumb = {
      url: "http://localhost:9000/static/1-t.png",
      isThumbnail: true,
      file: null,
    }
    const dropped = { url: "blob:2", isThumbnail: false, file: file("d.png") }

    expect(partitionMediaForUpload([pickedThumb, dropped])).toEqual({
      thumbnail: undefined,
      others: [dropped],
      stored: [{ url: pickedThumb.url, isThumbnail: true }],
    })
  })

  it("treats a missing file like a picked one", () => {
    expect(
      partitionMediaForUpload([{ url: "http://cdn/x.png", isThumbnail: false }])
    ).toEqual({
      thumbnail: undefined,
      others: [],
      stored: [{ url: "http://cdn/x.png", isThumbnail: false }],
    })
  })
})
