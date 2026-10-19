export enum PromotionType {
  STANDARD = "standard",
  BUYGET = "buyget",
  // Pagly: bank promotions are a separate admin type and are not applied at checkout yet.
  BANK = "bank",
  // Pagly: offer promotions belong to a Pagly offer (quantity breaks, bundles). They are calculated like standard ones.
  OFFER = "offer",
}

export enum PromotionStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum ApplicationMethodType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
}

export enum ApplicationMethodTargetType {
  ORDER = "order",
  SHIPPING_METHODS = "shipping_methods",
  ITEMS = "items",
}

export enum ApplicationMethodAllocation {
  EACH = "each",
  ACROSS = "across",
  ONCE = "once",
}

export enum PromotionRuleOperator {
  GTE = "gte",
  LTE = "lte",
  GT = "gt",
  LT = "lt",
  EQ = "eq",
  NE = "ne",
  IN = "in",
}

export enum CampaignBudgetType {
  SPEND = "spend",
  USAGE = "usage",
  USE_BY_ATTRIBUTE = "use_by_attribute",
  SPEND_BY_ATTRIBUTE = "spend_by_attribute",
}

export enum ComputedActions {
  ADD_ITEM_ADJUSTMENT = "addItemAdjustment",
  ADD_SHIPPING_METHOD_ADJUSTMENT = "addShippingMethodAdjustment",
  REMOVE_ITEM_ADJUSTMENT = "removeItemAdjustment",
  REMOVE_SHIPPING_METHOD_ADJUSTMENT = "removeShippingMethodAdjustment",
  CAMPAIGN_BUDGET_EXCEEDED = "campaignBudgetExceeded",
  PROMOTION_LIMIT_EXCEEDED = "promotionLimitExceeded",
  // Pagly: the cart lacks the attribute a use_by_attribute or spend_by_attribute budget counts by.
  CAMPAIGN_BUDGET_ATTRIBUTE_MISSING = "campaignBudgetAttributeMissing",
}

export enum PromotionActions {
  ADD = "add",
  REMOVE = "remove",
  REPLACE = "replace",
}

export enum RuleType {
  RULES = "rules",
  TARGET_RULES = "target_rules",
  BUY_RULES = "buy_rules",
}
