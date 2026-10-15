"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ProductVariantViewModel } from "./product";
import {
  buildProductDetailQuantityPricingPresentation,
  variantHasQuantityPricingCatalog,
} from "./productDetailQuantityPricingPresentation";
import type { VariantQuantityPricingCatalogViewModel } from "./quantityPricingPresentation";
import {
  buildQuantityPricingTierRows,
  type QuantityPricingUiLabels,
} from "./quantityPricingPresentation";

export function buildProductDetailQuantityPricingDisclosureTiers(
  catalog: VariantQuantityPricingCatalogViewModel,
) {
  return buildQuantityPricingTierRows(
    catalog.tiers.map((tier) => ({
      id: `tier-${tier.minQuantity}`,
      minQuantity: tier.minQuantity,
      unitPrice: tier.unitPrice,
    })),
  );
}

export type ProductDetailQuantityPricingDisclosureProps = Readonly<{
  variant: ProductVariantViewModel;
  quantity: number;
  labels: QuantityPricingUiLabels;
  formatUnitPrice: (amount: number) => string;
  rowClassName?: string;
  priceBlockClassName?: string;
  primaryPriceClassName?: string;
  listStrikeClassName?: string;
  triggerClassName?: string;
  panelClassName?: string;
  panelTitleClassName?: string;
  tierRowClassName?: string;
  tierListClassName?: string;
}>;

export function ProductDetailQuantityPricingDisclosure({
  variant,
  quantity,
  labels,
  formatUnitPrice,
  rowClassName = "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2",
  priceBlockClassName = "flex min-w-[7rem] flex-wrap items-baseline gap-x-2 tabular-nums",
  primaryPriceClassName = "text-2xl font-medium text-foreground",
  listStrikeClassName = "text-sm text-muted line-through",
  triggerClassName =
    "shrink-0 min-w-[9.5rem] text-left text-[11px] font-medium uppercase tracking-[0.12em] text-muted underline-offset-2 hover:text-foreground hover:underline sm:text-right",
  panelClassName =
    "absolute right-0 z-20 mt-2 w-[min(100vw-2rem,18rem)] rounded-md border border-border bg-background p-3 text-sm shadow-md",
  panelTitleClassName = "mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted",
  tierRowClassName = "flex justify-between gap-3 text-foreground",
  tierListClassName = "list-none space-y-1.5 pl-0",
}: ProductDetailQuantityPricingDisclosureProps) {
  const presentation = buildProductDetailQuantityPricingPresentation({
    variant,
    quantity,
    formatUnitPrice,
  });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const triggerId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node)) return;
      if (!root.contains(event.target)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open, close]);

  useEffect(() => {
    close();
  }, [variant.id, close]);

  if (!presentation) return null;

  const catalog = variant.quantityPricingCatalog!;
  const disclosureTiers = buildProductDetailQuantityPricingDisclosureTiers(catalog);
  const triggerLabel = `${labels.sectionTitle} ⓘ`;

  return (
    <div ref={rootRef} className={`relative ${rowClassName}`}>
      <div className={priceBlockClassName}>
        {presentation.quantityPricingActive ? (
          <>
            <span className={listStrikeClassName}>
              {presentation.listUnitPriceDisplay}
            </span>
            <span className={primaryPriceClassName}>
              {presentation.catalogUnitPriceDisplay}
            </span>
          </>
        ) : (
          <span className={primaryPriceClassName}>
            {presentation.listUnitPriceDisplay}
          </span>
        )}
      </div>
      <button
        type="button"
        id={triggerId}
        className={triggerClassName}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {triggerLabel}
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-labelledby={triggerId}
          className={panelClassName}
        >
          <p className={panelTitleClassName}>{labels.sectionTitle}</p>
          <ul className={tierListClassName}>
            <li className={tierRowClassName}>
              <span>{labels.listPriceRow}</span>
              <span>{formatUnitPrice(catalog.listUnitPrice)}</span>
            </li>
            {disclosureTiers.map((tier) => (
              <li key={tier.minQuantity} className={tierRowClassName}>
                <span>{tier.rangeLabel} unidades</span>
                <span>
                  {tier.unitPriceDisplay ?? formatUnitPrice(tier.unitPrice)}
                  {labels.perUnitSuffix}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
