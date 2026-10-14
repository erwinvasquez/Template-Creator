import type { CartLineViewModel, CartViewModel } from "./cart";
import { hasMeaningfulMoneyAmount, MONEY_EPSILON } from "./moneyPresentation";
import { cartLineHasQuantityPricing } from "./quantityPricingPresentation";

export function cartLineShowsQuantityPricing(line: CartLineViewModel): boolean {
  return cartLineHasQuantityPricing(line);
}

export type CartLineColumnTotalPresentation = Readonly<{
  finalLineTotalDisplay: string;
  originalLineTotalDisplay: string | null;
}>;

/** Total lista contractual: listUnitPrice × quantity cuando hay tier/label de qty pricing. */
export function resolveCartLineColumnOriginalLineTotal(
  line: CartLineViewModel,
): number | null {
  if (line.quantityPricing?.lineLabel) {
    return line.quantityPricing.listUnitPrice * line.quantity;
  }
  if (line.lineOriginalTotal != null) {
    return line.lineOriginalTotal;
  }
  return null;
}

export function resolveCartLineColumnFinalLineTotal(line: CartLineViewModel): number {
  return line.lineFinalTotal ?? 0;
}

export function resolveCartLineColumnTotalPresentation(
  line: CartLineViewModel,
): CartLineColumnTotalPresentation {
  const finalNum = resolveCartLineColumnFinalLineTotal(line);
  const originalNum = resolveCartLineColumnOriginalLineTotal(line);
  const finalLineTotalDisplay = line.lineDisplayPrice;

  if (
    originalNum == null ||
    finalNum <= 0 ||
    originalNum <= finalNum + MONEY_EPSILON
  ) {
    return { finalLineTotalDisplay, originalLineTotalDisplay: null };
  }

  let originalLineTotalDisplay: string | null = null;
  if (line.quantityPricing?.lineLabel) {
    originalLineTotalDisplay =
      line.lineListOriginalTotalDisplay ?? line.lineOriginalDisplayPrice ?? null;
  } else {
    originalLineTotalDisplay = line.lineOriginalDisplayPrice ?? null;
  }

  return { finalLineTotalDisplay, originalLineTotalDisplay };
}

/** Promociones monetarias — excluye quantity pricing (list → catalog). */
export function cartLineShowsPromotion(line: CartLineViewModel): boolean {
  if ((line.lineDiscountAmount ?? 0) > MONEY_EPSILON) return true;
  if ((line.pricingAdjustments?.length ?? 0) > 0) return true;
  const catalog = line.catalogUnitPrice ?? line.unitOriginalPrice;
  const effective = line.unitEffectivePrice;
  if (
    typeof catalog === "number" &&
    typeof effective === "number" &&
    catalog > effective + MONEY_EPSILON
  ) {
    return true;
  }
  return false;
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

const LINE_PROMOTION_JOIN_MAX_LENGTH = 56;

export type CartLinePromotionDisplay = Readonly<{
  labels: readonly string[];
  compactText: string;
  promotionCount: number;
}>;

export type FormatCartLinePromotionDisplayOptions = Readonly<{
  /** Ej. "2 promociones aplicadas" cuando hay muchas etiquetas largas. */
  multiPromotionsLabel?: string;
}>;

/** Texto compacto para UI de línea; datos desde pricingAdjustments (sin stacking en UI). */
export function formatCartLinePromotionDisplay(
  line: CartLineViewModel,
  options?: FormatCartLinePromotionDisplayOptions,
): CartLinePromotionDisplay | null {
  const labels = cartLinePromotionLabels(line);
  if (labels.length === 0) return null;

  if (labels.length === 1) {
    return {
      labels,
      compactText: labels[0]!,
      promotionCount: 1,
    };
  }

  const joined = labels.join(" · ");
  const multiFallback =
    options?.multiPromotionsLabel ?? `${labels.length} promociones aplicadas`;
  const compactText =
    joined.length <= LINE_PROMOTION_JOIN_MAX_LENGTH ? joined : multiFallback;

  return {
    labels,
    compactText,
    promotionCount: labels.length,
  };
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
  quantityDiscounts: string;
  promotions: string;
  subtotalPromotional: string;
  shipping: string;
  shippingPending: string;
  estimatedTotal: string;
  pricingUpdating: string;
  subtotal: string;
  /** Plantilla opcional; usar `{count}` para el número de promos en línea. */
  linePromotionsMulti?: string;
}>;

export type CartSummaryPresentation = "full" | "drawer";

export function buildCartSummaryRows(
  cart: CartViewModel,
  labels: CartPricingUiLabels,
  presentation: CartSummaryPresentation = "full",
): CartSummaryRow[] {
  const rows: CartSummaryRow[] = [];
  const quantityDiscount = hasMeaningfulMoneyAmount(cart.quantityDiscountTotal);
  const monetaryPromotion = hasMeaningfulMoneyAmount(cart.discountTotal);
  const hasDiscountBreakdown = quantityDiscount || monetaryPromotion;

  if (hasDiscountBreakdown && cart.subtotalOriginalDisplay) {
    rows.push({
      key: "subtotal-original",
      label: labels.subtotalOriginal,
      value: cart.subtotalOriginalDisplay,
      muted: true,
    });
  }

  if (quantityDiscount && cart.quantityDiscountTotalDisplay) {
    rows.push({
      key: "quantity-discount",
      label: labels.quantityDiscounts,
      value: `−${cart.quantityDiscountTotalDisplay}`,
    });
  }

  if (monetaryPromotion && cart.discountTotalDisplay) {
    rows.push({
      key: "discount",
      label: labels.promotions,
      value: `−${cart.discountTotalDisplay}`,
    });
  }

  if (
    presentation !== "drawer" &&
    hasDiscountBreakdown &&
    cart.subtotalPromotionalDisplay
  ) {
    rows.push({
      key: "subtotal-promotional",
      label: labels.subtotalPromotional,
      value: cart.subtotalPromotionalDisplay,
      emphasize: true,
    });
  } else if (!hasDiscountBreakdown) {
    rows.push({
      key: "subtotal",
      label: labels.subtotal,
      value: cart.subtotalDisplay,
      emphasize: true,
    });
  }

  if (
    presentation !== "drawer" &&
    cart.requiresShipping &&
    cart.estimatedTotal
  ) {
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

export function resolveLinePromotionsMultiLabel(
  labels: Pick<CartPricingUiLabels, "linePromotionsMulti">,
  promotionCount: number,
): string | undefined {
  if (!labels.linePromotionsMulti || promotionCount < 2) return undefined;
  return labels.linePromotionsMulti.replace("{count}", String(promotionCount));
}
