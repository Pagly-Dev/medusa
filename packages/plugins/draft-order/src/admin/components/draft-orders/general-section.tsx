import { Channels, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Container,
  Copy,
  Heading,
  Skeleton,
  Text,
  toast,
} from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { useRegion } from "../../hooks/api/regions"
import { useDate } from "../../hooks/common/use-date"
import { ActionMenu } from "../common/action-menu"
import { useDeleteDraftOrder } from "../../hooks/api/draft-orders"

interface GeneralSectionProps {
  order: HttpTypes.AdminOrder
}

export const GeneralSection = ({ order }: GeneralSectionProps) => {
  // Pagly: copy comes from the plugin's catalogs in src/admin/i18n.
  const { t } = useTranslation()
  const { getFullDate } = useDate()
  const navigate = useNavigate()

  const { mutateAsync: deleteDraftOrder, isPending: isDeleting } =
    useDeleteDraftOrder()

  const { region, isPending, isError, error } = useRegion(
    order.region_id!,
    undefined,
    {
      enabled: !!order.region_id,
    }
  )

  const isRegionLoaded = !!region && !isPending

  if (isError) {
    throw error
  }

  return (
    <Container className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-x-2">
          <Heading>
            {t("draftOrders.general.title", { displayId: order.display_id })}
          </Heading>
          <Copy content={`#${order.display_id}`} />
          {isRegionLoaded ? (
            <Badge size="2xsmall" rounded="full" asChild>
              <Link to={`/settings/regions/${region?.id}`}>{region?.name}</Link>
            </Badge>
          ) : (
            <Skeleton className="w-14 h-5 rounded-full" />
          )}
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          {[
            getFullDate({ date: order.created_at, includeTime: true }),
            order.sales_channel?.name &&
              t("orders.activity.events.placed.fromSalesChannel", {
                salesChannel: order.sales_channel.name,
              }),
          ]
            .filter(Boolean)
            .join(" ")}
        </Text>
      </div>
      <ActionMenu
        groups={[
          {
            actions: [
              {
                label: t("salesChannels.editSalesChannel"),
                icon: <Channels />,
                to: "sales-channel",
              },
              {
                label: t("draftOrders.general.delete"),
                icon: <Trash />,
                onClick: async () => {
                  try {
                    await deleteDraftOrder(order.id)
                    navigate("/draft-orders")
                  } catch (error: any) {
                    toast.error(error.message)
                  }
                },
                disabled: isDeleting,
              },
            ],
          },
        ]}
      />
    </Container>
  )
}
