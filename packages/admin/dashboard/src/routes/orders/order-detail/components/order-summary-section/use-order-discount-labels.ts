import { useQuery } from "@tanstack/react-query"

import { sdk } from "../../../../../lib/client"

/**
 * Pagly: one discount on an order as the `@pagly/storefront` plugin names it
 * (`GET /admin/orders/:id/discounts`): the offer, bank promotion or campaign
 * behind a code, with what it took off across items and shipping.
 */
export type OrderDiscountLabel = {
  label: string
  kind: string
  amount: number
  code: string | null
}

/**
 * The order's discounts by name, or undefined while they load and whenever
 * the route does not answer (no plugin, an older backend), so the summary
 * shows the codes as upstream does.
 */
export const useOrderDiscountLabels = (orderId: string) => {
  const { data } = useQuery({
    queryKey: ["orders", "detail", orderId, "discount-labels"],
    queryFn: () =>
      sdk.client.fetch<{ discounts: OrderDiscountLabel[] }>(
        `/admin/orders/${orderId}/discounts`
      ),
    enabled: Boolean(orderId),
    retry: false,
  })

  return Array.isArray(data?.discounts) ? data.discounts : undefined
}

/** A discount's name by its code, or the code itself when it has none. */
export const discountLabelOf = (
  labels: OrderDiscountLabel[] | undefined,
  code: string
) => labels?.find((discount) => discount.code === code)?.label ?? code
