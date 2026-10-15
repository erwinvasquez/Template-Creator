/**
 * Gramática visual compartida para líneas de producto (drawer, checkout, pedido, tracking).
 * Solo presentación — sin lógica comercial.
 */

export const commerceLineItemRowClassName = "flex min-w-0 gap-4";

/** ~64–72px en mobile; referencia cart drawer. */
export const commerceLineItemImageShellClassName =
  "relative h-[4.5rem] w-16 shrink-0 overflow-hidden bg-surface sm:h-[4.75rem] sm:w-[4.5rem]";

export const commerceLineItemImageBorderClassName =
  "border border-border bg-background";

export const commerceLineItemBodyClassName = "flex min-w-0 flex-1 flex-col";

export const commerceLineItemHeaderRowClassName =
  "flex min-w-0 items-start justify-between gap-3";

export const commerceLineItemTitleClassName =
  "line-clamp-2 font-serif text-base leading-snug text-primary";

export const commerceLineItemVariantClassName = "mt-1 text-xs text-muted";

export const commerceLineItemPromotionClassName =
  "mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-primary";

export const commerceLineItemQuantityPricingClassName =
  "mt-1 text-[11px] text-muted";

export const commerceLineItemQuantityClassName = "mt-1 text-xs text-muted tabular-nums";

export const commerceLineItemPriceColumnClassName =
  "shrink-0 text-right tabular-nums";

export const commerceLineItemCompareAtClassName =
  "text-[11px] text-muted line-through";

export const commerceLineItemFinalPriceClassName = "text-sm font-medium text-primary";

export const commerceLineItemListClassName = "list-none space-y-4 pl-0";
