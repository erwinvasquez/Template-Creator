export type CommerceFixtureId =
  | "catalog-empty"
  | "catalog-default"
  | "catalog-search-empty"
  | "product-simple"
  | "product-variants"
  | "sf01-gallery-variant"
  | "product-out-of-stock"
  | "cart-empty"
  | "cart-promotion"
  | "checkout-pickup"
  | "checkout-delivery";

export const COMMERCE_FIXTURE_IDS: CommerceFixtureId[] = [
  "catalog-empty",
  "catalog-default",
  "catalog-search-empty",
  "product-simple",
  "product-variants",
  "sf01-gallery-variant",
  "product-out-of-stock",
  "cart-empty",
  "cart-promotion",
  "checkout-pickup",
  "checkout-delivery",
];

export function parseCommerceFixture(
  raw: string | null | undefined,
): CommerceFixtureId {
  if (raw && (COMMERCE_FIXTURE_IDS as string[]).includes(raw)) {
    return raw as CommerceFixtureId;
  }
  return "catalog-default";
}
