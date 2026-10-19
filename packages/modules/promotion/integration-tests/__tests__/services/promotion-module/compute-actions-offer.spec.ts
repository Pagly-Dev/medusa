import { IPromotionModuleService } from "@medusajs/framework/types"
import {
  Modules,
  PromotionStatus,
  PromotionType,
} from "@medusajs/framework/utils"
import { moduleIntegrationTestRunner, SuiteOptions } from "@medusajs/test-utils"

jest.setTimeout(30000)

// Pagly: offer promotions belong to a Pagly offer (quantity breaks, bundles).
// The offer tags cart lines with a computed `pagly_offer` attribute, and each
// promotion targets the lines carrying its tag.
const offerPromotion = (code: string, value: number, tag: string) => ({
  code,
  type: PromotionType.OFFER,
  is_automatic: true,
  status: PromotionStatus.ACTIVE,
  application_method: {
    type: "percentage" as const,
    target_type: "items" as const,
    allocation: "each" as const,
    max_quantity: 1000,
    value,
    target_rules: [
      {
        attribute: "items.pagly_offer",
        operator: "eq" as const,
        values: [tag],
      },
    ],
  },
})

moduleIntegrationTestRunner({
  moduleName: Modules.PROMOTION,
  testSuite: ({ service }: SuiteOptions<IPromotionModuleService>) => {
    describe("Promotion Service: offer promotions", () => {
      it("applies automatic offer promotions to the lines tagged for them", async () => {
        await service.createPromotions([
          offerPromotion("OFFER_TIER_2", 50, "offer_1:2"),
          offerPromotion("OFFER_TIER_3", 60, "offer_1:3"),
        ])

        const result = await service.computeActions([], {
          currency_code: "usd",
          items: [
            {
              id: "item_tier_2",
              quantity: 2,
              subtotal: 200,
              original_total: 200,
              is_discountable: true,
              product: { id: "prod_a" },
              pagly_offer: "offer_1:2",
            },
            {
              id: "item_tier_3",
              quantity: 3,
              subtotal: 300,
              original_total: 300,
              is_discountable: true,
              product: { id: "prod_b" },
              pagly_offer: "offer_1:3",
            },
            {
              id: "item_untagged",
              quantity: 1,
              subtotal: 100,
              original_total: 100,
              is_discountable: true,
              product: { id: "prod_c" },
            },
          ],
        } as any)

        expect(JSON.parse(JSON.stringify(result))).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              action: "addItemAdjustment",
              item_id: "item_tier_2",
              amount: 100,
              code: "OFFER_TIER_2",
            }),
            expect.objectContaining({
              action: "addItemAdjustment",
              item_id: "item_tier_3",
              amount: 180,
              code: "OFFER_TIER_3",
            }),
          ])
        )
        expect(result).toHaveLength(2)
      })

      it("applies nothing when no line carries the offer tag", async () => {
        await service.createPromotions([
          offerPromotion("OFFER_TIER_2", 50, "offer_1:2"),
        ])

        const result = await service.computeActions([], {
          currency_code: "usd",
          items: [
            {
              id: "item_untagged",
              quantity: 2,
              subtotal: 200,
              original_total: 200,
              is_discountable: true,
              product: { id: "prod_a" },
            },
          ],
        } as any)

        expect(result).toEqual([])
      })

      it("rejects buy rules on an offer promotion", async () => {
        const [promotion] = await service.createPromotions([
          offerPromotion("OFFER_NO_BUY_RULES", 50, "offer_1:2"),
        ])

        const error = await service
          .addPromotionBuyRules(promotion.id, [
            {
              attribute: "items.product.id",
              operator: "eq",
              values: ["prod_a"],
            },
          ])
          .catch((e) => e)

        expect(error.message).toContain(
          "Can't add buy rules to an offer promotion"
        )
      })
    })
  },
})
