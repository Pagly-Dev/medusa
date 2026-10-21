import { resolve } from "path"
import { config } from "../__fixtures__/mocks"
import { createServer } from "../__fixtures__/server"
import { MedusaNextFunction } from "../index"

jest.setTimeout(30000)

jest.mock("../middlewares/ensure-publishable-api-key", () => {
  return {
    ensurePublishableApiKeyMiddleware: async (
      req: any,
      res: any,
      next: MedusaNextFunction
    ) => next(),
  }
})

/**
 * Pagly: a pattern in storeCors still admits on its own, without asking
 * http.storeCorsOrigin; the resolver only hears about what the list misses.
 */
const storeCorsOrigin = jest.fn()

const preflight = (origin: string) => ({
  headers: { origin, "access-control-request-method": "GET" },
})

describe("/store CORS patterns with http.storeCorsOrigin", function () {
  let request

  beforeAll(async function () {
    Object.assign(config.projectConfig.http, {
      storeCors: "http://localhost:8000,/\\.cloudfront\\.net$/",
      storeCorsOrigin,
    })

    const rootDir = resolve(__dirname, "../__fixtures__/routers")
    const { request: request_ } = await createServer(rootDir)

    request = request_
  })

  beforeEach(function () {
    storeCorsOrigin.mockReset()
  })

  it("admits an origin a pattern matches without asking", async function () {
    const res = await request(
      "OPTIONS",
      "/store/custom",
      preflight("https://d123.cloudfront.net")
    )

    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://d123.cloudfront.net"
    )
    expect(storeCorsOrigin).not.toHaveBeenCalled()
  })

  it("asks about an origin no entry matches", async function () {
    storeCorsOrigin.mockResolvedValue(true)

    const res = await request(
      "OPTIONS",
      "/store/custom",
      preflight("https://www.tienda.com.uy")
    )

    expect(storeCorsOrigin).toHaveBeenCalledWith(
      "https://www.tienda.com.uy",
      expect.anything()
    )
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://www.tienda.com.uy"
    )
  })
})
