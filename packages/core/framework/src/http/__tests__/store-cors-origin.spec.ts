import { resolve } from "path"
import { logger } from "../../logger"
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
 * Pagly: a store's own storefront domains change at runtime, so `/store` CORS
 * asks `http.storeCorsOrigin` about an origin the static `storeCors` list
 * does not have.
 */
const storeCorsOrigin = jest.fn()

const preflight = (path: string, origin?: string) => ({
  headers: {
    ...(origin ? { origin } : {}),
    "access-control-request-method": "GET",
  },
})

describe("/store CORS with http.storeCorsOrigin", function () {
  let request

  beforeAll(async function () {
    Object.assign(config.projectConfig.http, { storeCorsOrigin })

    const rootDir = resolve(__dirname, "../__fixtures__/routers")
    const { request: request_ } = await createServer(rootDir)

    request = request_
  })

  beforeEach(function () {
    storeCorsOrigin.mockReset()
  })

  it("admits a listed origin without asking", async function () {
    const res = await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "http://localhost:8000")
    )

    expect(res.status).toBe(204)
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:8000"
    )
    expect(storeCorsOrigin).not.toHaveBeenCalled()
  })

  it("asks about an unlisted origin, with the request's scope", async function () {
    storeCorsOrigin.mockResolvedValue(false)

    await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "https://www.tienda.com.uy")
    )

    expect(storeCorsOrigin).toHaveBeenCalledTimes(1)
    expect(storeCorsOrigin).toHaveBeenCalledWith(
      "https://www.tienda.com.uy",
      expect.objectContaining({ resolve: expect.any(Function) })
    )
  })

  it("admits an unlisted origin the resolver allows", async function () {
    storeCorsOrigin.mockResolvedValue(true)

    const res = await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "https://www.tienda.com.uy")
    )

    expect(res.status).toBe(204)
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://www.tienda.com.uy"
    )
    expect(res.headers["access-control-allow-credentials"]).toBe("true")
    expect(res.headers["vary"]).toMatch(/Origin/)
  })

  it("accepts a resolver that answers synchronously", async function () {
    storeCorsOrigin.mockReturnValue(true)

    const res = await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "https://www.tienda.com.uy")
    )

    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://www.tienda.com.uy"
    )
  })

  it("admits the actual request too, not just the preflight", async function () {
    storeCorsOrigin.mockResolvedValue(true)

    const res = await request("GET", "/store/custom", {
      headers: { origin: "https://www.tienda.com.uy" },
    })

    expect(res.status).toBe(200)
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://www.tienda.com.uy"
    )
  })

  it("refuses an unlisted origin the resolver does not allow", async function () {
    storeCorsOrigin.mockResolvedValue(false)

    const res = await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "https://evil.example.com")
    )

    expect(res.status).toBe(204)
    expect(res.headers["access-control-allow-origin"]).not.toBeTruthy()
  })

  it("refuses, and warns, when the resolver fails", async function () {
    const warn = jest.spyOn(logger, "warn").mockImplementation(() => {})
    storeCorsOrigin.mockRejectedValue(new Error("ledger down"))

    const res = await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "https://www.tienda.com.uy")
    )

    expect(res.status).toBe(204)
    expect(res.headers["access-control-allow-origin"]).not.toBeTruthy()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("https://www.tienda.com.uy")
    )
    warn.mockRestore()
  })

  it("refuses when the resolver throws synchronously", async function () {
    const warn = jest.spyOn(logger, "warn").mockImplementation(() => {})
    storeCorsOrigin.mockImplementation(() => {
      throw new Error("boom")
    })

    const res = await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "https://www.tienda.com.uy")
    )

    expect(res.status).toBe(204)
    expect(res.headers["access-control-allow-origin"]).not.toBeTruthy()
    warn.mockRestore()
  })

  it("admits only on a plain true, not on any truthy answer", async function () {
    for (const answer of ["yes", 1, {}, "true"]) {
      storeCorsOrigin.mockResolvedValueOnce(answer)

      const res = await request(
        "OPTIONS",
        "/store/custom",
        preflight("/store/custom", "https://www.tienda.com.uy")
      )

      expect(res.headers["access-control-allow-origin"]).not.toBeTruthy()
    }
  })

  it("asks again on every request, leaving any memory to the resolver", async function () {
    storeCorsOrigin.mockResolvedValueOnce(true).mockResolvedValueOnce(false)

    const first = await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "https://www.tienda.com.uy")
    )
    const second = await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "https://www.tienda.com.uy")
    )

    expect(storeCorsOrigin).toHaveBeenCalledTimes(2)
    expect(first.headers["access-control-allow-origin"]).toBe(
      "https://www.tienda.com.uy"
    )
    expect(second.headers["access-control-allow-origin"]).not.toBeTruthy()
  })

  it("does not let one admitted origin open the door to another", async function () {
    storeCorsOrigin.mockImplementation(
      async (origin: string) => origin === "https://www.tienda.com.uy"
    )

    const admitted = await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "https://www.tienda.com.uy")
    )
    const other = await request(
      "OPTIONS",
      "/store/custom",
      preflight("/store/custom", "https://otra.example.com")
    )

    expect(admitted.headers["access-control-allow-origin"]).toBe(
      "https://www.tienda.com.uy"
    )
    expect(other.headers["access-control-allow-origin"]).not.toBeTruthy()
  })

  it("does not ask when the request has no Origin", async function () {
    const res = await request("GET", "/store/custom")

    expect(res.status).toBe(200)
    expect(storeCorsOrigin).not.toHaveBeenCalled()
  })

  it("leaves /admin CORS alone", async function () {
    storeCorsOrigin.mockResolvedValue(true)

    const res = await request("OPTIONS", "/admin/orders", {
      ...preflight("/admin/orders", "https://www.tienda.com.uy"),
      adminSession: { jwt: { userId: "admin_user" } },
    })

    expect(res.status).toBe(204)
    expect(res.headers["access-control-allow-origin"]).not.toBeTruthy()
    expect(storeCorsOrigin).not.toHaveBeenCalled()
  })
})
