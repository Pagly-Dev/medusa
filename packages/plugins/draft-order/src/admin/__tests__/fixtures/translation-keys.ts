import { readFileSync } from "node:fs"
import path from "node:path"
import ts from "typescript"

import { ADMIN_ROOT } from "./hard-coded-copy"

export type KeyUse = {
  file: string
  line: number
  /** The key, or the call's source when its key is not a string literal. */
  key: string
  literal: boolean
  /** Whether the call passes `count`, so the key needs plural forms. */
  plural: boolean
}

const isTranslateCall = (node: ts.CallExpression) => {
  const callee = node.expression
  return (
    (ts.isIdentifier(callee) && callee.text === "t") ||
    (ts.isPropertyAccessExpression(callee) && callee.name.text === "t")
  )
}

const passesCount = (options: ts.Expression | undefined) =>
  !!options &&
  ts.isObjectLiteralExpression(options) &&
  options.properties.some(
    (property) =>
      (ts.isPropertyAssignment(property) ||
        ts.isShorthandPropertyAssignment(property)) &&
      ts.isIdentifier(property.name) &&
      property.name.text === "count"
  )

/**
 * Every translation key `file` uses: `t()` calls, `<Trans i18nKey>` and a
 * route config's `label` when it names a `translationNs`.
 */
export const findTranslationKeys = (file: string): KeyUse[] => {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )
  const uses: KeyUse[] = []
  const add = (node: ts.Node, key: ts.Node | undefined, plural: boolean) => {
    const literal =
      !!key && (ts.isStringLiteral(key) || ts.isNoSubstitutionTemplateLiteral(key))
    uses.push({
      file: path.relative(ADMIN_ROOT, file),
      line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
      key: literal
        ? (key as ts.StringLiteral).text
        : (key ?? node).getText(source),
      literal,
      plural,
    })
  }

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && isTranslateCall(node)) {
      add(node, node.arguments[0], passesCount(node.arguments[1]))
    }
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      node.tagName.getText(source) === "Trans"
    ) {
      const attribute = (name: string) =>
        node.attributes.properties.find(
          (property): property is ts.JsxAttribute =>
            ts.isJsxAttribute(property) && property.name.getText(source) === name
        )
      add(node, attribute("i18nKey")?.initializer, !!attribute("count"))
    }
    if (
      ts.isObjectLiteralExpression(node) &&
      node.properties.some(
        (property) =>
          ts.isPropertyAssignment(property) &&
          property.name.getText(source) === "translationNs"
      )
    ) {
      const label = node.properties.find(
        (property): property is ts.PropertyAssignment =>
          ts.isPropertyAssignment(property) &&
          property.name.getText(source) === "label"
      )
      add(node, label?.initializer, false)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)

  return uses
}
