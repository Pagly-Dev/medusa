import i18n from "i18next"
import { describe, expect, it } from "vitest"

import { adminSourceFiles } from "../../__tests__/fixtures/hard-coded-copy"
import {
  dashboardResources,
  pluginResources,
} from "../../__tests__/fixtures/i18n"
import { findTranslationKeys } from "../../__tests__/fixtures/translation-keys"

const flatten = (
  value: Record<string, unknown>,
  prefix = ""
): Record<string, string> =>
  Object.entries(value).reduce<Record<string, string>>((acc, [key, child]) => {
    const path = `${prefix}${key}`
    if (child && typeof child === "object") {
      return { ...acc, ...flatten(child as Record<string, unknown>, `${path}.`) }
    }
    acc[path] = child as string
    return acc
  }, {})

const catalog = (language: string) =>
  flatten(pluginResources[language]?.translation ?? {})

const en = catalog("en")
const es = catalog("es")
const dashboardEn = flatten(dashboardResources.en.translation)

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/

const placeholders = (text: string) =>
  [...text.matchAll(/\{\{\s*(\w+)\s*\}\}|<(\d+)>/g)].map((m) => m[0]).sort()

const uses = adminSourceFiles().flatMap((file) => findTranslationKeys(file))

/**
 * Spanish words that read the same as the English ones. Anything else equal
 * in both catalogs is copy someone forgot to translate.
 */
const SAME_IN_SPANISH = new Set(["Stock", "Total"])

/** Second person singular "tú" forms; the admin speaks to the merchant as "vos". */
const TU_FORMS =
  /(?<!\p{L})(agrega|añade|elige|selecciona|ingresa|introduce|crea|edita|usa|escribe|busca|haz|elimina|quita|guarda|revisa|completa|define|gestiona|transfiere|cambia|aplica|puedes|tienes|debes|quieres|necesitas|asegúrate)(?!\p{L})/iu

describe("the plugin's catalogs", () => {
  it("ship English and Spanish", () => {
    expect(Object.keys(pluginResources).sort()).toEqual(["en", "es"])
    expect(Object.keys(en).length).toBeGreaterThan(0)
  })

  it("give Spanish exactly the English keys", () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort())
  })

  it("keep each string's placeholders in both languages", () => {
    const mismatched = Object.keys(en).filter(
      (key) =>
        JSON.stringify(placeholders(en[key])) !==
        JSON.stringify(placeholders(es[key] ?? ""))
    )

    expect(mismatched).toEqual([])
  })

  it("have no empty strings", () => {
    const empty = Object.entries({ ...en, ...es })
      .filter(([, value]) => typeof value !== "string" || !value.trim())
      .map(([key]) => key)

    expect(empty).toEqual([])
  })

  it("translate every string into Spanish", () => {
    const untranslated = Object.keys(en).filter(
      (key) => es[key] === en[key] && !SAME_IN_SPANISH.has(en[key])
    )

    expect(untranslated).toEqual([])
  })

  it("speak to the merchant as vos", () => {
    const tu = Object.entries(es)
      .filter(([, value]) => TU_FORMS.test(value))
      .map(([key, value]) => `${key}: ${value}`)

    expect(tu).toEqual([])
  })

  it("never redefine one of the dashboard's keys", () => {
    expect(Object.keys(en).filter((key) => key in dashboardEn)).toEqual([])
  })

  it("hold no key the screens do not use", () => {
    const used = new Set(uses.map(({ key }) => key))
    const unused = Object.keys(en).filter(
      (key) => !used.has(key.replace(PLURAL_SUFFIX, ""))
    )

    expect(unused).toEqual([])
  })
})

describe("the draft order screens", () => {
  it("are read by the key finder", () => {
    expect(uses.map(({ key }) => key)).toContain(
      "draftOrders.list.noRecordsMessage"
    )
  })

  it("name their keys literally, so these checks can see them", () => {
    const dynamic = uses
      .filter(({ literal }) => !literal)
      .map(({ file, line, key }) => `${file}:${line} ${key}`)

    expect(dynamic).toEqual([])
  })

  it.each(["en", "es"])("only use keys that exist in %s", (language) => {
    const missing = uses
      .filter(({ literal }) => literal)
      .flatMap(({ file, line, key, plural }) => {
        const has = (needed: string) =>
          i18n.getResource(language, "translation", needed) !== undefined
        // With `count`, i18next reads `_one`/`_other` and falls back to the key.
        const needed =
          plural && !has(key) ? [`${key}_one`, `${key}_other`] : [key]

        return needed
          .filter((needed) => !has(needed))
          .map((needed) => `${file}:${line} ${needed}`)
      })

    expect(missing).toEqual([])
  })
})
