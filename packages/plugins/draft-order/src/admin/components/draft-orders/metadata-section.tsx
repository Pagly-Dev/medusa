import { ArrowUpRightOnBox } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Badge, Container, Heading, IconButton } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

interface MetadataSectionProps {
  order: HttpTypes.AdminOrder
}

export const MetadataSection = ({ order }: MetadataSectionProps) => {
  // Pagly: copy comes from the dashboard's catalogs.
  const { t } = useTranslation()

  return (
    <Container className="flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        <Heading level="h2">{t("metadata.header")}</Heading>
        <Badge size="2xsmall" rounded="full">
          {t("metadata.numberOfKeys", {
            count: Object.keys(order.metadata || {}).length,
          })}
        </Badge>
      </div>
      <IconButton
        variant="transparent"
        size="small"
        className="text-ui-fg-muted hover:text-ui-fg-subtle"
        asChild
      >
        <Link to="metadata">
          <ArrowUpRightOnBox />
        </Link>
      </IconButton>
    </Container>
  )
}
