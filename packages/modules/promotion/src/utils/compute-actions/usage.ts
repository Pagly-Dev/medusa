import {
  BigNumberInput,
  CampaignBudgetExceededAction,
  CampaignBudgetUsageContext,
  CampaignBudgetUsageDTO,
  ComputeActionContext,
  InferEntityType,
  PromotionDTO,
} from "@medusajs/framework/types"
import {
  CampaignBudgetType,
  ComputedActions,
  MathBN,
} from "@medusajs/framework/utils"
import { Promotion } from "@models"

// Pagly: what one attribute value (for example, one customer email) has
// already received from a spend_by_attribute budget. computeActions seeds it
// from campaign_budget_usage and the helpers add each adjustment to it, so the
// cap counts every line of the cart, not each line on its own.
export type AttributeBudgetSpend = {
  used: BigNumberInput
}

export function recordAttributeBudgetSpend(
  attributeBudgetSpend: AttributeBudgetSpend | undefined,
  amount: BigNumberInput
): void {
  if (!attributeBudgetSpend) {
    return
  }

  attributeBudgetSpend.used = MathBN.add(attributeBudgetSpend.used, amount)
}

/**
 * Compute the action for a budget exceeded.
 * @param promotion - the promotion being applied
 * @param amount - amount can be:
 *  1. discounted amount in case of spend budget
 *  2. number of times the promotion has been used in case of usage budget
 *  3. number of times the promotion has been used by a specific attribute value in case of use_by_attribute budget
 *  4. discounted amount in case of spend_by_attribute budget
 * @param attributeUsage - the attribute usage in case of use_by_attribute or spend_by_attribute budget
 * @returns the exceeded action if the budget is exceeded, otherwise undefined
 */
export function computeActionForBudgetExceeded(
  promotion: PromotionDTO | InferEntityType<typeof Promotion>,
  amount: BigNumberInput,
  attributeUsage?: Pick<CampaignBudgetUsageDTO, "used"> | AttributeBudgetSpend
): CampaignBudgetExceededAction | void {
  const campaignBudget = promotion.campaign?.budget

  if (!campaignBudget) {
    return
  }

  // Pagly: spend_by_attribute is checked against the attribute value's spend too.
  if (
    (campaignBudget.type === CampaignBudgetType.USE_BY_ATTRIBUTE ||
      campaignBudget.type === CampaignBudgetType.SPEND_BY_ATTRIBUTE) &&
    !attributeUsage
  ) {
    return
  }

  const campaignBudgetUsed = attributeUsage
    ? attributeUsage.used
    : campaignBudget.used ?? 0

  const totalUsed =
    campaignBudget.type === CampaignBudgetType.SPEND ||
    campaignBudget.type === CampaignBudgetType.SPEND_BY_ATTRIBUTE
      ? MathBN.add(campaignBudgetUsed, amount)
      : MathBN.add(campaignBudgetUsed, 1)

  if (campaignBudget.limit && MathBN.gt(totalUsed, campaignBudget.limit)) {
    return {
      action: ComputedActions.CAMPAIGN_BUDGET_EXCEEDED,
      code: promotion.code!,
    }
  }
}

export function getBudgetUsageContextFromComputeActionContext(
  computeActionContext: ComputeActionContext
): CampaignBudgetUsageContext {
  return {
    customer_id:
      computeActionContext.customer_id ??
      (computeActionContext.customer as any)?.id ??
      null,
    customer_email:
      (computeActionContext.email as string | undefined | null) ?? null,
  }
}
