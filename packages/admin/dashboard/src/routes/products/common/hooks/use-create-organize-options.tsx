import { toast } from "@medusajs/ui"
import { useCreateProductCategory } from "../../../../hooks/api/categories"
import { useCreateProductType } from "../../../../hooks/api/product-types"
import { useCreateProductTag } from "../../../../hooks/api/tags"

/**
 * Pagly: an ASCII handle, so accented names ("Camisón") don't end up as
 * percent-encoded storefront URLs.
 */
const toHandle = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/**
 * The combobox passes the typed text, or for multi-selects the whole value
 * with the typed text last.
 */
export const createdLabel = (value: string | string[]) =>
  Array.isArray(value) ? value[value.length - 1] ?? "" : value

/**
 * A multi-select value with the typed text the combobox added swapped for the
 * created id, or dropped if creating failed.
 */
export const withCreated = (
  current: string[] | undefined,
  label: string,
  id: string | undefined
) => [...(current ?? []).filter((v) => v !== label), ...(id ? [id] : [])]

/**
 * Pagly: creates product types, tags and categories from the
 * product forms' comboboxes. Each creator resolves to the new id, or to
 * undefined after showing the error.
 */
export const useCreateOrganizeOptions = () => {
  const { mutateAsync: createType } = useCreateProductType()
  const { mutateAsync: createTag } = useCreateProductTag()
  const { mutateAsync: createCategory } = useCreateProductCategory()

  const run = async (create: () => Promise<string>) => {
    try {
      return await create()
    } catch (error) {
      toast.error((error as Error).message)
      return undefined
    }
  }

  return {
    type: (value: string) =>
      run(
        async () => (await createType({ value: value.trim() })).product_type.id
      ),
    tag: (value: string) =>
      run(
        async () => (await createTag({ value: value.trim() })).product_tag.id
      ),
    category: (name: string) =>
      run(
        async () =>
          (
            await createCategory({
              name: name.trim(),
              handle: toHandle(name),
              is_active: true,
              is_internal: false,
            })
          ).product_category.id
      ),
  }
}
