"use client";

import type { CartLineViewModel, CartViewModel } from "./cart";
import { commerceLineItemQuantityPricingClassName } from "./commerceLineItemPresentation";
import {
  buildCartSummaryRows,
  resolveCartLineColumnTotalPresentation,
  cartLineShowsPromotion,
  cartLineShowsQuantityPricing,
  cartShowsPricingUpdating,
  formatCartLinePromotionDisplay,
  resolveCartEstimatedTotalDisplay,
  type CartPricingUiLabels,
} from "./cartPricingPresentation";
import type { QuantityPricingUiLabels } from "./quantityPricingPresentation";

export type CartLinePricingProps = Readonly<{
  line: CartLineViewModel;
  className?: string;
  originalClassName?: string;
  effectiveClassName?: string;
  totalClassName?: string;
  promotionClassName?: string;
  quantityPricingClassName?: string;
  /** Sustituto i18n cuando hay varias promos y el join supera el límite compacto. */
  multiPromotionsLabel?: string;
}>;

export function CartLinePricing({
  line,
  className,
  originalClassName,
  effectiveClassName,
  totalClassName,
  promotionClassName,
  quantityPricingClassName = commerceLineItemQuantityPricingClassName,
  multiPromotionsLabel,
}: CartLinePricingProps) {
  const hasPromotion = cartLineShowsPromotion(line);
  const hasQuantityPricing = cartLineShowsQuantityPricing(line);
  const promotionDisplay = formatCartLinePromotionDisplay(line, {
    multiPromotionsLabel,
  });
  const qtyListStrike = line.quantityPricing?.listUnitPriceDisplay;

  return (
    <div className={className}>
      {hasQuantityPricing && qtyListStrike ? (
        <div className={effectiveClassName}>
          <span className={originalClassName}>{qtyListStrike}</span>
          <span>{line.quantityPricing?.catalogUnitPriceDisplay ?? line.unitDisplayPrice}</span>
        </div>
      ) : hasPromotion ? (
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
      {hasQuantityPricing && line.quantityPricing?.lineLabel ? (
        <span className={quantityPricingClassName}>{line.quantityPricing.lineLabel}</span>
      ) : null}
      {hasPromotion && promotionDisplay ? (
        <span className={promotionClassName} title={promotionDisplay.labels.join(" · ")}>
          {promotionDisplay.compactText}
        </span>
      ) : null}
    </div>
  );
}

export type CartLineCommercialMetaProps = Readonly<{
  line: CartLineViewModel;
  quantityPricingClassName?: string;
  promotionClassName?: string;
  multiPromotionsLabel?: string;
  /** Si true, solo muestra la etiqueta de quantity pricing (promo aparte). */
  omitPromotion?: boolean;
}>;

export type CartLinePromotionMetaProps = Readonly<{
  line: CartLineViewModel;
  promotionClassName?: string;
  multiPromotionsLabel?: string;
}>;

export function CartLinePromotionMeta({
  line,
  promotionClassName,
  multiPromotionsLabel,
}: CartLinePromotionMetaProps) {
  const promotionDisplay = formatCartLinePromotionDisplay(line, {
    multiPromotionsLabel,
  });
  const promoLabel = cartLineShowsPromotion(line) ? promotionDisplay?.compactText : null;
  if (!promoLabel) return null;
  return (
    <p className={promotionClassName} title={promotionDisplay?.labels.join(" · ")}>
      {promoLabel}
    </p>
  );
}

export type CartLineQuantityPricingUnitPricesProps = Readonly<{
  line: CartLineViewModel;
  perUnitSuffix?: string;
  wrapperClassName?: string;
  listClassName?: string;
  catalogClassName?: string;
}>;

/** List → catalog unit display when quantity pricing is active (carrito; separado de promos). */
export function CartLineQuantityPricingUnitPrices({
  line,
  perUnitSuffix = " c/u",
  wrapperClassName = "mt-1 text-[11px] leading-snug text-foreground",
  listClassName = "text-muted line-through",
  catalogClassName = "tabular-nums",
}: CartLineQuantityPricingUnitPricesProps) {
  if (!cartLineShowsQuantityPricing(line) || !line.quantityPricing?.listUnitPriceDisplay) {
    return null;
  }
  const rowClassName = [
    wrapperClassName ?? "mt-1 text-[11px] leading-snug",
    "text-foreground",
    "flex flex-wrap items-baseline gap-x-1.5",
  ].join(" ");

  return (
    <p className={rowClassName}>
      <span className={listClassName}>{line.quantityPricing.listUnitPriceDisplay}</span>
      <span className={catalogClassName}>
        {line.quantityPricing.catalogUnitPriceDisplay}
        {perUnitSuffix}
      </span>
    </p>
  );
}

export type CartLineQuantityPricingNextTierProps = Readonly<{
  line: CartLineViewModel;
  className?: string;
}>;

export function CartLineQuantityPricingNextTier({
  line,
  className,
}: CartLineQuantityPricingNextTierProps) {
  const label = line.quantityPricing?.nextTierProgressLabel;
  if (!label) return null;
  return <p className={className}>{label}</p>;
}

export type CartLineQuantityPricingColumnTotalProps = Readonly<{
  line: CartLineViewModel;
  wrapperClassName?: string;
  finalClassName?: string;
  compareClassName?: string;
}>;

/** Columna derecha: total lista tachado + total final cuando aplica (qty, promo o ambos). */
export function CartLineQuantityPricingColumnTotal({
  line,
  wrapperClassName,
  finalClassName,
  compareClassName,
}: CartLineQuantityPricingColumnTotalProps) {
  const { finalLineTotalDisplay, originalLineTotalDisplay } =
    resolveCartLineColumnTotalPresentation(line);

  return (
    <div className={wrapperClassName}>
      {originalLineTotalDisplay ? (
        <p className={compareClassName}>{originalLineTotalDisplay}</p>
      ) : null}
      <p className={finalClassName}>{finalLineTotalDisplay}</p>
    </div>
  );
}

export function CartLineCommercialMeta({
  line,
  quantityPricingClassName,
  promotionClassName,
  multiPromotionsLabel,
  omitPromotion = false,
}: CartLineCommercialMetaProps) {
  const qtyLabel = line.quantityPricing?.lineLabel;
  if (!qtyLabel && omitPromotion) return null;
  return (
    <>
      {qtyLabel ? (
        <p className={quantityPricingClassName}>{qtyLabel}</p>
      ) : null}
      {!omitPromotion ? (
        <CartLinePromotionMeta
          line={line}
          promotionClassName={promotionClassName}
          multiPromotionsLabel={multiPromotionsLabel}
        />
      ) : null}
    </>
  );
}

export function defaultQuantityPricingUiLabels(
  partial?: Partial<QuantityPricingUiLabels>,
): QuantityPricingUiLabels {
  return {
    sectionTitle: partial?.sectionTitle ?? "Precios por cantidad",
    perUnitSuffix: partial?.perUnitSuffix ?? " c/u",
    listPriceRow: partial?.listPriceRow ?? "Precio normal",
    appliedAtQuantity:
      partial?.appliedAtQuantity ?? "Precio por cantidad aplicado: {unitPrice} c/u",
    nextTierTemplate:
      partial?.nextTierTemplate ?? "Agregá {count} más y pagá {unitPrice} c/u",
    cartLineTemplate:
      partial?.cartLineTemplate ?? "Precio por cantidad · {range} unidades",
    plpTeaserTemplate:
      partial?.plpTeaserTemplate ?? "Desde {unitPrice} c/u por cantidad",
  };
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
    quantityDiscounts: cartUi.quantityDiscounts ?? "Descuentos por cantidad",
    promotions: cartUi.promotions ?? "Promociones",
    subtotalPromotional: cartUi.subtotalPromotional ?? "Subtotal promocional",
    shipping: cartUi.shipping ?? "Envío",
    shippingPending: cartUi.shippingPending ?? "Por calcular",
    estimatedTotal: cartUi.estimatedTotal ?? "Total estimado",
    pricingUpdating: cartUi.pricingUpdating ?? "Actualizando promoción…",
    subtotal: cartUi.subtotal ?? "Subtotal",
  };
}
