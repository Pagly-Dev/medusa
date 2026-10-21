import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

/** `src/admin`, the root every reported path is relative to. */
export const ADMIN_ROOT = fileURLToPath(new URL("../..", import.meta.url))

/** Directories that hold no screen copy: tests, the catalogs and static data. */
const SKIPPED_DIRS = new Set(["__tests__", "i18n", "data"])

export const adminSourceFiles = (dir = ADMIN_ROOT): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      return SKIPPED_DIRS.has(entry.name) ? [] : adminSourceFiles(full)
    }
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")
      ? [full]
      : []
  })

/** Props and attributes whose string value a merchant reads. */
const COPY_NAME_SET = new Set([
  "alt",
  "aria-label",
  "breadcrumb",
  "cancelText",
  "confirmText",
  "content",
  "description",
  "emptyStateMessage",
  "header",
  "heading",
  "hint",
  "label",
  "message",
  "placeholder",
  "subtitle",
  "text",
  "title",
  "tooltip",
])

const isCopyName = (name: string) =>
  COPY_NAME_SET.has(name) ||
  /(Label|Text|Title|Message|Description|Placeholder|Heading|Hint|Tooltip)$/.test(
    name
  )

/** Attributes that never carry copy, even when their value has spaces. */
const NON_COPY_ATTRIBUTES = new Set([
  "autoComplete",
  "className",
  "form",
  "href",
  "id",
  "key",
  "name",
  "role",
  "side",
  "align",
  "size",
  "to",
  "type",
  "value",
  "variant",
  "weight",
  "leading",
  "level",
  "data-testid",
])

/** Calls whose string arguments are shown: zod messages and `pluralize`. */
const COPY_CALLS = new Set([
  "email",
  "length",
  "max",
  "min",
  "nonempty",
  "pluralize",
  "refine",
  "regex",
  "superRefine",
])

/** A dotted i18n key such as `draftOrders.summary.heading`. */
const I18N_KEY = /^[a-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/

/** A label or a sentence, as opposed to an id, a path or a class name. */
const looksLikeCopy = (text: string) => {
  const value = text.trim()
  if (!/[A-Za-z]{2,}/.test(value) || I18N_KEY.test(value)) {
    return false
  }
  return /\S\s+[A-Za-z]{2,}|[A-Za-z]{2,}\s+\S/.test(value) || /^[A-Z][a-z]/.test(value)
}

const nameOf = (name: ts.Node | undefined) => {
  if (!name) {
    return undefined
  }
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text
  }
  if (ts.isJsxNamespacedName(name)) {
    return `${name.namespace.text}:${name.name.text}`
  }
  return undefined
}

const calleeName = (call: ts.CallExpression | ts.NewExpression) => {
  const callee = call.expression
  if (ts.isIdentifier(callee)) {
    return { object: undefined, name: callee.text }
  }
  if (ts.isPropertyAccessExpression(callee)) {
    const object = ts.isIdentifier(callee.expression)
      ? callee.expression.text
      : undefined
    return { object, name: callee.name.text }
  }
  return { object: undefined, name: undefined }
}

/**
 * "copy" positions show any word they hold (JSX text, copy props, toasts);
 * "maybe-copy" positions (other attributes, variables, returns) only count
 * strings that read like a label or a sentence.
 */
type Verdict = "copy" | "maybe-copy" | "not-copy" | "continue"

const COMPARISONS = new Set([
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
  ts.SyntaxKind.InKeyword,
])

/**
 * Decides, from one ancestor of a string, whether that string is shown to a
 * merchant. "continue" hands the decision to the next ancestor up.
 */
const judge = (node: ts.Node, child: ts.Node): Verdict => {
  if (
    ts.isImportDeclaration(node) ||
    ts.isExportDeclaration(node) ||
    ts.isCaseClause(node) ||
    ts.isElementAccessExpression(node) ||
    ts.isTypeNode(node) ||
    ts.isLiteralTypeNode(node)
  ) {
    return "not-copy"
  }
  if (ts.isBinaryExpression(node)) {
    return COMPARISONS.has(node.operatorToken.kind) ? "not-copy" : "continue"
  }
  if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
    if (ts.isCallExpression(node) && node.expression === child) {
      return "continue"
    }
    const { object, name } = calleeName(node)
    if (name === "t") {
      return "not-copy"
    }
    if (object === "toast" || (name && COPY_CALLS.has(name))) {
      return "copy"
    }
    return "not-copy"
  }
  if (ts.isJsxAttribute(node)) {
    const name = nameOf(node.name)!
    if (isCopyName(name)) {
      return "copy"
    }
    return NON_COPY_ATTRIBUTES.has(name) || name.startsWith("data-")
      ? "not-copy"
      : "maybe-copy"
  }
  if (ts.isJsxExpression(node)) {
    return ts.isJsxAttribute(node.parent) ? "continue" : "copy"
  }
  if (ts.isPropertyAssignment(node)) {
    if (node.name === child) {
      return "not-copy"
    }
    return isCopyName(nameOf(node.name) ?? "") ? "copy" : "not-copy"
  }
  if (ts.isVariableDeclaration(node) || ts.isReturnStatement(node)) {
    return "maybe-copy"
  }
  if (
    ts.isConditionalExpression(node) ||
    ts.isParenthesizedExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isTemplateSpan(node) ||
    ts.isTemplateExpression(node) ||
    ts.isArrayLiteralExpression(node) ||
    ts.isSpreadElement(node)
  ) {
    return "continue"
  }
  return "not-copy"
}

const verdictFor = (literal: ts.Node): Verdict => {
  let child: ts.Node = literal
  let node: ts.Node | undefined = literal.parent
  while (node && !ts.isSourceFile(node)) {
    const verdict = judge(node, child)
    if (verdict !== "continue") {
      return verdict
    }
    child = node
    node = node.parent
  }
  return "not-copy"
}

const isCopy = (literal: ts.Node, text: string) => {
  const verdict = verdictFor(literal)
  if (verdict === "copy") {
    return /[A-Za-z]/.test(text) && !I18N_KEY.test(text.trim())
  }
  return verdict === "maybe-copy" && looksLikeCopy(text)
}

/**
 * The template's text with each substitution shown as `0`. A quantity's `x`
 * ("2x") reads the same in every language the admin ships, so it goes too.
 */
const templateText = (node: ts.TemplateExpression) =>
  (
    node.head.text +
    node.templateSpans.map((span) => `0${span.literal.text}`).join("")
  ).replace(/0x\b/g, "0")

export type HardCodedCopy = { file: string; line: number; text: string }

/**
 * Every string in `file` a merchant would read without it going through
 * `t()`. `code` stands in for the file's contents.
 */
export const findHardCodedCopy = (
  file: string,
  code = readFileSync(file, "utf8")
): HardCodedCopy[] => {
  const source = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )
  const found: HardCodedCopy[] = []
  const report = (node: ts.Node, text: string) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart())
    found.push({
      file: path.relative(ADMIN_ROOT, file),
      line: line + 1,
      text: text.replace(/\s+/g, " ").trim(),
    })
  }

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      // A lone `x` follows a quantity ("2x").
      if (/[A-Za-z]/.test(node.text) && node.text.trim() !== "x") {
        report(node, node.text)
      }
    } else if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node)
    ) {
      if (isCopy(node, node.text)) {
        report(node, node.text)
      }
    } else if (ts.isTemplateExpression(node)) {
      if (isCopy(node, templateText(node))) {
        report(node, node.getText(source))
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)

  return found
}
