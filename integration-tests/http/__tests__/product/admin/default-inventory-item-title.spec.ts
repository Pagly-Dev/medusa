import { createProductVariantsWorkflow } from "@medusajs/core-flows"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  adminHeaders,
  createAdminUser,
} from "../../../../helpers/create-admin-user"

jest.setTimeout(50000)

const inventoryFields = {
  fields:
    "variants.title,variants.inventory_items.inventory.id,variants.inventory_items.inventory.title,variants.inventory_items.inventory.description",
}

const itemOf = (product, variantTitle: string) => {
  const variant = product.variants.find((v) => v.title === variantTitle)

  expect(variant.inventory_items).toHaveLength(1)

  return variant.inventory_items[0].inventory
}

medusaIntegrationTestRunner({
  testSuite: ({ dbConnection, getContainer, api }) => {
    let shippingProfile

    beforeEach(async () => {
      await createAdminUser(dbConnection, adminHeaders, getContainer())

      shippingProfile = (
        await api.post(
          `/admin/shipping-profiles`,
          { name: "default", type: "default" },
          adminHeaders
        )
      ).data.shipping_profile
    })

    // The dashboard's create form gives a product in one version these names.
    const oneVersionProduct = (overrides = {}) => ({
      title: "Taza de cerámica",
      shipping_profile_id: shippingProfile.id,
      options: [{ title: "Default option", values: ["Default option value"] }],
      variants: [
        {
          title: "Default variant",
          manage_inventory: true,
          prices: [{ currency_code: "usd", amount: 100 }],
          options: { "Default option": "Default option value" },
        },
      ],
      ...overrides,
    })

    const remera = (overrides = {}) => ({
      title: "Remera básica",
      shipping_profile_id: shippingProfile.id,
      options: [
        { title: "Talle", values: ["S", "M", "L"] },
        { title: "Color", values: ["Blanco", "Negro"] },
      ],
      variants: [
        {
          title: "S / Blanco",
          manage_inventory: true,
          prices: [{ currency_code: "usd", amount: 100 }],
          options: { Talle: "S", Color: "Blanco" },
        },
        {
          title: "M / Negro",
          manage_inventory: true,
          prices: [{ currency_code: "usd", amount: 100 }],
          options: { Talle: "M", Color: "Negro" },
        },
      ],
      ...overrides,
    })

    const getProduct = async (id: string) =>
      (
        await api.get(`/admin/products/${id}`, {
          ...adminHeaders,
          params: inventoryFields,
        })
      ).data.product

    describe("the inventory item made for a variant that manages inventory", () => {
      it("is named after a product in one version", async () => {
        const product = (
          await api.post("/admin/products", oneVersionProduct(), {
            ...adminHeaders,
            params: inventoryFields,
          })
        ).data.product

        const item = itemOf(product, "Default variant")

        expect(item.title).toEqual("Taza de cerámica")
        expect(item.description).toEqual("Taza de cerámica")
      })

      it("shows the product's name on the inventory list and detail", async () => {
        const product = (
          await api.post("/admin/products", oneVersionProduct(), {
            ...adminHeaders,
            params: inventoryFields,
          })
        ).data.product

        const { id } = itemOf(product, "Default variant")

        const detail = (
          await api.get(`/admin/inventory-items/${id}`, adminHeaders)
        ).data.inventory_item

        expect(detail.title).toEqual("Taza de cerámica")

        const list = (
          await api.get(`/admin/inventory-items?q=Taza`, adminHeaders)
        ).data.inventory_items

        expect(list.map((i) => i.title)).toEqual(["Taza de cerámica"])
      })

      it("adds a named variant's title after the product's", async () => {
        const product = (
          await api.post("/admin/products", remera(), {
            ...adminHeaders,
            params: inventoryFields,
          })
        ).data.product

        expect(itemOf(product, "S / Blanco").title).toEqual(
          "Remera básica · S / Blanco"
        )
        expect(itemOf(product, "M / Negro").title).toEqual(
          "Remera básica · M / Negro"
        )
      })

      it("is named after the product when a variant is added to it", async () => {
        const created = (
          await api.post("/admin/products", remera(), adminHeaders)
        ).data.product

        await api.post(
          `/admin/products/${created.id}/variants`,
          {
            title: "L / Blanco",
            manage_inventory: true,
            prices: [{ currency_code: "usd", amount: 100 }],
            options: { Talle: "L", Color: "Blanco" },
          },
          adminHeaders
        )

        const product = await getProduct(created.id)

        expect(itemOf(product, "L / Blanco").title).toEqual(
          "Remera básica · L / Blanco"
        )
      })

      it("is named after the product when variants are added in a batch", async () => {
        const created = (
          await api.post("/admin/products", remera(), adminHeaders)
        ).data.product

        await api.post(
          `/admin/products/${created.id}/variants/batch`,
          {
            create: [
              {
                title: "L / Negro",
                manage_inventory: true,
                prices: [{ currency_code: "usd", amount: 100 }],
                options: { Talle: "L", Color: "Negro" },
              },
            ],
          },
          adminHeaders
        )

        const product = await getProduct(created.id)

        expect(itemOf(product, "L / Negro").title).toEqual(
          "Remera básica · L / Negro"
        )
      })

      it("is named after the product when a variant starts managing inventory", async () => {
        const created = (
          await api.post(
            "/admin/products",
            oneVersionProduct({
              variants: [
                {
                  ...oneVersionProduct().variants[0],
                  manage_inventory: false,
                },
              ],
            }),
            adminHeaders
          )
        ).data.product

        await api.post(
          `/admin/products/${created.id}/variants/${created.variants[0].id}`,
          { manage_inventory: true },
          adminHeaders
        )

        const product = await getProduct(created.id)

        expect(itemOf(product, "Default variant").title).toEqual(
          "Taza de cerámica"
        )
      })

      it("is named after the product when the product update turns inventory on", async () => {
        const created = (
          await api.post(
            "/admin/products",
            oneVersionProduct({
              variants: [
                {
                  ...oneVersionProduct().variants[0],
                  manage_inventory: false,
                },
              ],
            }),
            adminHeaders
          )
        ).data.product

        await api.post(
          `/admin/products/${created.id}`,
          {
            variants: [{ id: created.variants[0].id, manage_inventory: true }],
          },
          adminHeaders
        )

        const product = await getProduct(created.id)

        expect(itemOf(product, "Default variant").title).toEqual(
          "Taza de cerámica"
        )
      })
    })

    describe("the default inventory item's name when names change", () => {
      it("follows a one-version product's new name", async () => {
        const created = (
          await api.post("/admin/products", oneVersionProduct(), adminHeaders)
        ).data.product

        await api.post(
          `/admin/products/${created.id}`,
          { title: "Taza esmaltada" },
          adminHeaders
        )

        const item = itemOf(await getProduct(created.id), "Default variant")

        expect(item.title).toEqual("Taza esmaltada")
        expect(item.description).toEqual("Taza esmaltada")
      })

      it("follows the product's new name for a named variant", async () => {
        const created = (
          await api.post("/admin/products", remera(), adminHeaders)
        ).data.product

        await api.post(
          `/admin/products/${created.id}`,
          { title: "Remera de lino" },
          adminHeaders
        )

        const product = await getProduct(created.id)

        expect(itemOf(product, "S / Blanco").title).toEqual(
          "Remera de lino · S / Blanco"
        )
        expect(itemOf(product, "M / Negro").title).toEqual(
          "Remera de lino · M / Negro"
        )
      })

      it("follows a variant's new name", async () => {
        const created = (
          await api.post("/admin/products", remera(), adminHeaders)
        ).data.product
        const variant = created.variants.find((v) => v.title === "S / Blanco")

        await api.post(
          `/admin/products/${created.id}/variants/${variant.id}`,
          { title: "S / Crudo" },
          adminHeaders
        )

        expect(itemOf(await getProduct(created.id), "S / Crudo").title).toEqual(
          "Remera básica · S / Crudo"
        )
      })

      it("adds the title a one-version product's variant gets", async () => {
        const created = (
          await api.post("/admin/products", oneVersionProduct(), adminHeaders)
        ).data.product

        await api.post(
          `/admin/products/${created.id}/variants/${created.variants[0].id}`,
          { title: "250 ml" },
          adminHeaders
        )

        expect(itemOf(await getProduct(created.id), "250 ml").title).toEqual(
          "Taza de cerámica · 250 ml"
        )
      })

      it("follows a variant renamed through the product update", async () => {
        const created = (
          await api.post("/admin/products", oneVersionProduct(), adminHeaders)
        ).data.product

        await api.post(
          `/admin/products/${created.id}`,
          { variants: [{ id: created.variants[0].id, title: "250 ml" }] },
          adminHeaders
        )

        expect(itemOf(await getProduct(created.id), "250 ml").title).toEqual(
          "Taza de cerámica · 250 ml"
        )
      })

      it("follows variants renamed in a batch", async () => {
        const created = (
          await api.post("/admin/products", remera(), adminHeaders)
        ).data.product
        const variant = created.variants.find((v) => v.title === "M / Negro")

        await api.post(
          `/admin/products/${created.id}/variants/batch`,
          { update: [{ id: variant.id, title: "M / Grafito" }] },
          adminHeaders
        )

        expect(
          itemOf(await getProduct(created.id), "M / Grafito").title
        ).toEqual("Remera básica · M / Grafito")
      })

      it("leaves an item the merchant renamed", async () => {
        const created = (
          await api.post("/admin/products", oneVersionProduct(), {
            ...adminHeaders,
            params: inventoryFields,
          })
        ).data.product
        const { id } = itemOf(created, "Default variant")

        await api.post(
          `/admin/inventory-items/${id}`,
          { title: "Taza (depósito)" },
          adminHeaders
        )
        await api.post(
          `/admin/products/${created.id}`,
          { title: "Taza esmaltada" },
          adminHeaders
        )

        expect(
          itemOf(await getProduct(created.id), "Default variant").title
        ).toEqual("Taza (depósito)")
      })

      it("keeps the item's name when the update renames nothing", async () => {
        const created = (
          await api.post("/admin/products", oneVersionProduct(), adminHeaders)
        ).data.product

        await api.post(
          `/admin/products/${created.id}`,
          { description: "Hecha a mano" },
          adminHeaders
        )

        expect(
          itemOf(await getProduct(created.id), "Default variant").title
        ).toEqual("Taza de cerámica")
      })
    })

    describe("adding variants", () => {
      // The step that reads the products' names, wherever the workflow nests it.
      const productsRead = (transaction) =>
        Object.entries(transaction.getFlow().steps).find(([key]) =>
          key.endsWith(".get-variant-products")
        )?.[1] as { invoke: { state: string } } | undefined

      const addVariant = async (variant: Record<string, unknown>) => {
        const product = (
          await api.post("/admin/products", remera(), adminHeaders)
        ).data.product

        const { transaction } = await createProductVariantsWorkflow(
          getContainer()
        ).run({
          input: {
            product_variants: [
              {
                product_id: product.id,
                title: "L / Blanco",
                options: { Talle: "L", Color: "Blanco" },
                prices: [{ currency_code: "usd", amount: 100 }],
                ...variant,
              },
            ],
          },
        })

        return transaction
      }

      it("does not read the products when no variant gets a default inventory item", async () => {
        const transaction = await addVariant({ manage_inventory: false })

        expect(productsRead(transaction)?.invoke.state ?? "skipped").toEqual(
          "skipped"
        )
      })

      it("reads the products when a variant gets a default inventory item", async () => {
        const transaction = await addVariant({ manage_inventory: true })

        expect(productsRead(transaction)?.invoke.state).toEqual("done")
      })
    })
  },
})
