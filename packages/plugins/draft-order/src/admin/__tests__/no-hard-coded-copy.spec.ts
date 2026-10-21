import path from "node:path"
import { describe, expect, it } from "vitest"

import {
  ADMIN_ROOT,
  adminSourceFiles,
  findHardCodedCopy,
} from "./fixtures/hard-coded-copy"

const scan = (code: string) =>
  findHardCodedCopy(path.join(ADMIN_ROOT, "snippet.tsx"), code).map(
    ({ text }) => text
  )

describe("the hard-coded copy scan", () => {
  it("finds text, copy props, toasts and validation messages", () => {
    expect(
      scan(`
        export const handle = { breadcrumb: () => "Draft Orders" }
        const columns = [{ header: "Display ID" }]
        const A = ({ n }) => (
          <Section title="Summary" placeholder={"Search"}>
            <Heading>Shipping</Heading>
            {n > 1 ? "Items" : "Item"}
            {\`\${n}x items\`}
            {\`\${n} \${n === 1 ? "item" : "items"}\`}
            <CommandBar selectedLabel={(count) => \`\${count} selected\`} />
          </Section>
        )
        const notify = () => toast.success("Draft order updated")
        const count = pluralize(n, "items", "item")
        const schema = z.string().min(1, "Name is required")
        const label = "Convert to order"
        const text = \`\${quantity} available\`
      `)
    ).toEqual([
      "Draft Orders",
      "Display ID",
      "Summary",
      "Search",
      "Shipping",
      "Items",
      "Item",
      "`${n}x items`",
      "item",
      "items",
      "`${count} selected`",
      "Draft order updated",
      "items",
      "item",
      "Name is required",
      "Convert to order",
      "`${quantity} available`",
    ])
  })

  it("leaves keys, class names, comparisons and query fields alone", () => {
    expect(
      scan(`
        const A = ({ status }) => (
          <div className="flex items-center gap-x-2" to="/draft-orders" rounded="full">
            {t("draftOrders.domain")}
            {t("draftOrders.items", { defaultValue: "Some Items" })}
            {status === "Completed Order" ? t("a.b") : null}
            <Text>{n}x</Text>
            <li>{\`\${n}x \${title}\`}</li>
          </div>
        )
        const query = { fields: "+customer.*,+Items Long" }
        import { Foo } from "Some Module"
        type Label = "Open Order"
      `)
    ).toEqual([])
  })
})

/**
 * Not copy: the JSON drawer's code tokens (the Escape key, `null`,
 * `undefined`), which the dashboard's own JSON drawer shows as they are.
 */
const NOT_COPY = new Set([
  "components/draft-orders/json-view-section.tsx:esc",
  "components/draft-orders/json-view-section.tsx:null",
  "components/draft-orders/json-view-section.tsx:undefined",
])

describe("draft order screens", () => {
  it("send every string a merchant reads through t()", () => {
    const found = adminSourceFiles()
      .flatMap((file) => findHardCodedCopy(file))
      .filter(({ file, text }) => !NOT_COPY.has(`${file}:${text}`))
      .map(({ file, line, text }) => `${file}:${line} ${text}`)

    expect(found).toEqual([])
  })
})
