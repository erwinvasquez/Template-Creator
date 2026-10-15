"use client";

import type { ProductVariantViewModel } from "./product";
import {
  buildNextTierProgressMessage,
  resolveVariantQuantityPricingState,
  type QuantityPricingUiLabels,
} from "./quantityPricingPresentation";

export type ProductDetailQuantityPricingProps = Readonly<{
  variant: ProductVariantViewModel;
  quantity: number;
  labels: QuantityPricingUiLabels;
  formatUnitPrice: (amount: number) => string;
  sectionClassName?: string;
  titleClassName?: string;
  rowClassName?: string;
  appliedClassName?: string;
  progressClassName?: string;
}>;

export function ProductDetailQuantityPricing({
  variant,
  quantity,
  labels,
  formatUnitPrice,
  sectionClassName,
  titleClassName,
  rowClassName,
  appliedClassName,
  progressClassName,
}: ProductDetailQuantityPricingProps) {
  const catalog = variant.quantityPricingCatalog;
  if (!catalog || catalog.tiers.length === 0) return null;

  const state = resolveVariantQuantityPricingState({
    listUnitPrice: catalog.listUnitPrice,
    quantity,
    tiers: catalog.tiers.map((tier) => ({
      id: `t-${tier.minQuantity}`,
      minQuantity: tier.minQuantity,
      unitPrice: tier.unitPrice,
    })),
    maxPurchasableQuantity: variant.maxQuantity ?? null,
  });

  const nextMessage = buildNextTierProgressMessage(
    state,
    labels,
    formatUnitPrice(state.nextTier?.unitPrice ?? 0),
  );

  return (
    <div className={sectionClassName}>
      <p className={titleClassName}>{labels.sectionTitle}</p>
      <ul className="list-none space-y-1 pl-0">
        <li className={rowClassName}>
          <span>{labels.listPriceRow}</span>
          <span>{formatUnitPrice(catalog.listUnitPrice)}</span>
        </li>
        {catalog.tiers.map((tier) => (
          <li key={tier.minQuantity} className={rowClassName}>
            <span>{tier.rangeLabel}</span>
            <span>
              {tier.unitPriceDisplay ?? formatUnitPrice(tier.unitPrice)}
              {labels.perUnitSuffix}
            </span>
          </li>
        ))}
      </ul>
      {state.quantityPricingActive ? (
        <p className={appliedClassName}>
          {labels.appliedAtQuantity.replace(
            "{unitPrice}",
            formatUnitPrice(state.catalogUnitPrice),
          )}
        </p>
      ) : null}
      {nextMessage ? <p className={progressClassName}>{nextMessage}</p> : null}
    </div>
  );
}
