import type { CartLineViewModel, CartViewModel } from "./cart";

const MONEY_EPSILON = 0.005;

export function cartLineShowsPromotion(line: CartLineViewModel): boolean {
  if ((line.lineDiscountAmount ?? 0) > MONEY_EPSILON) return true;
  if (
    typeof line.unitOriginalPrice === "number" &&
    typeof line.unitEffectivePrice === "number" &&
    line.unitOriginalPrice > line.unitEffectivePrice + MONEY_EPSILON
  ) {
    return true;
  }
  return (line.pricingAdjustments?.length ?? 0) > 0;
}

export function cartHasPromotionalPricing(cart: CartViewModel): boolean {
  return (
    (cart.discountTotal ?? 0) > MONEY_EPSILON ||
    (cart.appliedPromotions?.length ?? 0) > 0 ||
    cart.lines.some(cartLineShowsPromotion)
  );
}

export function cartShowsPricingUpdating(cart: CartViewModel): boolean {
  return cart.pricingStatus === "updating";
}

export function cartLinePromotionLabels(line: CartLineViewModel): string[] {
  const labels = (line.pricingAdjustments ?? [])
    .map((adjustment) => adjustment.label.trim())
    .filter((label) => label.length > 0);
  return [...new Set(labels)];
}

export type CartSummaryRow = Readonly<{
  key: string;
  label: string;
  value: string;
  muted?: boolean;
  emphasize?: boolean;
}>;

export type CartPricingUiLabels = Readonly<{
  subtotalOriginal: string;
  promotions: string;
  subtotalPromotional: string;
  shipping: string;
  shippingPending: string;
  estimatedTotal: string;
  pricingUpdating: string;
  subtotal: string;
}>;

export function buildCartSummaryRows(
  cart: CartViewModel,
  labels: CartPricingUiLabels,
): CartSummaryRow[] {
  const rows: CartSummaryRow[] = [];
  const monetaryPromotion = (cart.discountTotal ?? 0) > MONEY_EPSILON;

  if (monetaryPromotion && cart.subtotalOriginalDisplay) {
    rows.push({
      key: "subtotal-original",
      label: labels.subtotalOriginal,
      value: cart.subtotalOriginalDisplay,
      muted: true,
    });
  }

  if (monetaryPromotion && cart.discountTotalDisplay) {
    rows.push({
      key: "discount",
      label: labels.promotions,
      value: `−${cart.discountTotalDisplay}`,
    });
  }

  if (monetaryPromotion && cart.subtotalPromotionalDisplay) {
    rows.push({
      key: "subtotal-promotional",
      label: labels.subtotalPromotional,
      value: cart.subtotalPromotionalDisplay,
      emphasize: true,
    });
  } else if (!monetaryPromotion) {
    rows.push({
      key: "subtotal",
      label: labels.subtotal,
      value: cart.subtotalDisplay,
      emphasize: true,
    });
  }

  if (cart.requiresShipping && cart.estimatedTotal) {
    rows.push({
      key: "shipping",
      label: labels.shipping,
      value: labels.shippingPending,
      muted: true,
    });
  }

  return rows;
}

export function resolveCartEstimatedTotalDisplay(cart: CartViewModel): string {
  if (cart.subtotalPromotionalDisplay && cartHasPromotionalPricing(cart)) {
    return cart.subtotalPromotionalDisplay;
  }
  return cart.subtotalDisplay;
}
