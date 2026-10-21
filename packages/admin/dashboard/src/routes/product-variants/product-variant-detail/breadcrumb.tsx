import { HttpTypes } from "@medusajs/types"
import { UIMatch } from "react-router-dom"
import { useProductVariant } from "../../../hooks/api"
import { getVariantTitle } from "../../../lib/default-names"
import { VARIANT_DETAIL_FIELDS } from "./constants"

type ProductVariantDetailBreadcrumbProps =
  UIMatch<HttpTypes.AdminProductVariantResponse>

export const ProductVariantDetailBreadcrumb = (
  props: ProductVariantDetailBreadcrumbProps
) => {
  const { id, variant_id } = props.params || {}

  const { variant } = useProductVariant(
    id!,
    variant_id!,
    {
      fields: VARIANT_DETAIL_FIELDS,
    },
    {
      initialData: props.loaderData,
      enabled: Boolean(id) && Boolean(variant_id),
    }
  )

  if (!variant) {
    return null
  }

  // Pagly: a product's one version is named after the product.
  return <span>{getVariantTitle(variant.title, variant.product?.title)}</span>
}

export const seo = (match: UIMatch<HttpTypes.AdminProductVariantResponse>) => ({
  title: getVariantTitle(
    match.loaderData?.variant?.title,
    match.loaderData?.variant?.product?.title
  ),
})
