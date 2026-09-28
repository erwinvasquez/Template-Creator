import type { ProductCardViewModel } from "./catalog";

export type CatalogAvailabilityPresentation =
  | "available"
  | "contact"
  | "sold_out"
  | "made_to_order_available";

/**
 * PLP card availability — host sends `stockLabel` + optional `madeToOrderUpsell`.
 * `stockLabel` stays `out_of_stock` when immediate stock is 0; upsell signals MTO bridge.
 */
export function resolveCatalogAvailabilityPresentation(
  product: ProductCardViewModel,
): CatalogAvailabilityPresentation {
  if (product.stockLabel === "contact") return "contact";
  if (product.stockLabel === "out_of_stock") {
    if (product.madeToOrderUpsell?.productHref) {
      return "made_to_order_available";
    }
    return "sold_out";
  }
  return "available";
}

/** Card link: prefer MTO upsell href when presentation is `made_to_order_available`. */
export function catalogCardHref(product: ProductCardViewModel): string {
  const presentation = resolveCatalogAvailabilityPresentation(product);
  if (presentation === "made_to_order_available") {
    return product.madeToOrderUpsell!.productHref;
  }
  return product.href;
}
