import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { describe, expect, test } from "vitest"

import { getProductImportCsvTemplate } from "../../../routes/products/product-import/helpers/import-template"

/**
 * Pagly: merchants know the product as Pagly. Medusa is the engine under it
 * and never shows up in admin copy, links or sample files.
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
const src = join(dir, "../..")
const locales = readdirSync(dir).filter(
  (file) => file.endsWith(".json") && file !== "$schema.json"
)

/** Lines that mention Medusa, once `@medusajs/*` package imports are dropped. */
function mentions(file: string) {
  return readFileSync(join(src, file), "utf8")
    .split(/\r?\n/)
    .map((line) => line.replace(/["']@medusajs\/[\w-]+["']/g, ""))
    .filter((line) => /medusa/i.test(line))
}

describe("Pagly brand in admin copy", () => {
  test.each(locales)("%s never says Medusa", (file) => {
    const json = JSON.parse(readFileSync(join(dir, file), "utf8"))
    const offenders = flatten(json)
      .filter(([, value]) => /medusa/i.test(value))
      .map(([key]) => key)

    expect(offenders).toEqual([])
  })

  test("the cloud login says Pagly", () => {
    const en = JSON.parse(readFileSync(join(dir, "en.json"), "utf8"))
    const es = JSON.parse(readFileSync(join(dir, "es.json"), "utf8"))

    expect(en.auth.login.cloud).toBe("Log in with Pagly Cloud")
    expect(es.auth.login.cloud).toBe("Iniciar sesión con Pagly Cloud")
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

  test.each([
    "components/layout/user-menu/user-menu.tsx",
    "routes/profile/profile-edit/components/edit-profile-form/edit-profile-form.tsx",
    "routes/products/product-import/helpers/import-template.ts",
  ])("%s links nowhere near Medusa", (file) => {
    expect(mentions(file)).toEqual([])
  })

  test("the user menu keeps profile, shortcuts, theme and logout", () => {
    const menu = readFileSync(
      join(src, "components/layout/user-menu/user-menu.tsx"),
      "utf8"
    )

    expect(menu).not.toContain("app.menus.user.documentation")
    expect(menu).not.toContain("app.menus.user.changelog")
    expect(menu).toContain("app.menus.user.profileSettings")
    expect(menu).toContain("app.menus.user.shortcuts")
    expect(menu).toContain("<ThemeToggle />")
    expect(menu).toContain("<Logout />")
  })

  test("the import template is a Pagly sample with the upstream columns", () => {
    const csv = decodeURI(getProductImportCsvTemplate()).replace(
      "data:text/csv;charset=utf-8,",
      ""
    )
    const [header, ...rows] = csv.split("\n")

    expect(csv).not.toMatch(/medusa/i)
    expect(header.split(",")).toHaveLength(42)
    expect(header.startsWith("Product Id,Product Handle,Product Title")).toBe(
      true
    )
    expect(rows.length).toBeGreaterThanOrEqual(2)
    expect(rows.map((row) => row.split(",")[2])).toContain("Ceramic Coffee Mug")
  })
})
