"use client";

import type { CartLineViewModel, CartViewModel } from "./cart";
import {
  buildCartSummaryRows,
  cartLinePromotionLabels,
  cartLineShowsPromotion,
  cartShowsPricingUpdating,
  resolveCartEstimatedTotalDisplay,
  type CartPricingUiLabels,
} from "./cartPricingPresentation";

export type CartLinePricingProps = Readonly<{
  line: CartLineViewModel;
  className?: string;
  originalClassName?: string;
  effectiveClassName?: string;
  totalClassName?: string;
  promotionClassName?: string;
}>;

export function CartLinePricing({
  line,
  className,
  originalClassName,
  effectiveClassName,
  totalClassName,
  promotionClassName,
}: CartLinePricingProps) {
  const hasPromotion = cartLineShowsPromotion(line);
  const promotionLabels = cartLinePromotionLabels(line)

  return (
    <div className={className}>
      {hasPromotion ? (
        <div className={effectiveClassName}>
          {line.unitCompareAtPrice ? (
            <span className={originalClassName}>{line.unitCompareAtPrice}</span>
          ) : null}
          <span>{line.unitDisplayPrice}</span>
        </div>
      ) : (
        <span className={effectiveClassName}>{line.unitDisplayPrice}</span>
      )}
      <span className={totalClassName}>{line.lineDisplayPrice}</span>
      {hasPromotion && promotionLabels.length > 0 ? (
        <span className={promotionClassName}>{promotionLabels[0]}</span>
      ) : null}
    </div>
  );
}

export type CartSummaryPricingProps = Readonly<{
  cart: CartViewModel;
  labels: CartPricingUiLabels;
  rowClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  emphasizeClassName?: string;
  statusClassName?: string;
}>;

export function CartSummaryPricing({
  cart,
  labels,
  rowClassName,
  labelClassName,
  valueClassName,
  emphasizeClassName,
  statusClassName,
}: CartSummaryPricingProps) {
  const rows = buildCartSummaryRows(cart, labels)
  const estimatedTotal = resolveCartEstimatedTotalDisplay(cart)

  return (
    <div>
      {rows.map((row) => (
        <div key={row.key} className={rowClassName}>
          <span className={labelClassName}>{row.label}</span>
          <span className={row.emphasize ? emphasizeClassName : valueClassName}>
            {row.value}
          </span>
        </div>
      ))}
      {cart.estimatedTotal ? (
        <div className={rowClassName}>
          <span className={labelClassName}>{labels.estimatedTotal}</span>
          <span className={emphasizeClassName}>{estimatedTotal}</span>
        </div>
      ) : null}
      {cartShowsPricingUpdating(cart) ? (
        <p className={statusClassName} role="status">{labels.pricingUpdating}</p>
      ) : null}
    </div>
  );
}

export function defaultCartPricingUiLabels(
  cartUi: Record<string, string | undefined>,
): CartPricingUiLabels {
  return {
    subtotalOriginal: cartUi.subtotalOriginal ?? "Subtotal original",
    promotions: cartUi.promotions ?? "Promociones",
    subtotalPromotional: cartUi.subtotalPromotional ?? "Subtotal promocional",
    shipping: cartUi.shipping ?? "Envío",
    shippingPending: cartUi.shippingPending ?? "Por calcular",
    estimatedTotal: cartUi.estimatedTotal ?? "Total estimado",
    pricingUpdating: cartUi.pricingUpdating ?? "Actualizando promoción…",
    subtotal: cartUi.subtotal ?? "Subtotal",
  };
}
