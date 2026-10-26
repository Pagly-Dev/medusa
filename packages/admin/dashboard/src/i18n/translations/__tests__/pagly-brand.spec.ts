import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { describe, expect, test } from "vitest"

/**
 * Pagly: merchants know the product as Pagly. Medusa is the engine under it
 * and never shows up in admin copy. "Medusa Cloud" stays: it names Medusa's
 * own hosted login, which only appears when that provider is configured.
 */

function flatten(value: unknown, prefix = ""): [string, string][] {
  if (typeof value === "string") {
    return [[prefix, value]]
  }
  if (!value || typeof value !== "object") {
    return []
  }
  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key)
  )
}

const dir = join(__dirname, "..")
const locales = readdirSync(dir).filter(
  (file) => file.endsWith(".json") && file !== "$schema.json"
)

describe("Pagly brand in admin copy", () => {
  test.each(locales)("%s never says Medusa", (file) => {
    const json = JSON.parse(readFileSync(join(dir, file), "utf8"))
    const offenders = flatten(json)
      .filter(([, value]) => value.replace(/Medusa Cloud/g, "").includes("Medusa"))
      .map(([key]) => key)

    expect(offenders).toEqual([])
  })

  test("the login screen welcomes merchants to Pagly", () => {
    const en = JSON.parse(readFileSync(join(dir, "en.json"), "utf8"))
    const es = JSON.parse(readFileSync(join(dir, "es.json"), "utf8"))

    expect(en.login.title).toBe("Welcome to Pagly")
    expect(es.login.title).toBe("Bienvenido a Pagly")
  })

  test("the HTML shell is titled Pagly", () => {
    const html = readFileSync(join(dir, "../../../index.html"), "utf8")

    expect(html).toContain("<title>Pagly</title>")
  })
})
