import type { ProductVariantViewModel } from "./product";
import {
  resolveVariantQuantityPricingState,
  type QuantityPricingTierRowViewModel,
  type VariantQuantityPricingStateViewModel,
} from "./quantityPricingPresentation";

export type ProductDetailQuantityPricingPresentation = Readonly<{
  hasQuantityPricing: true;
  quantityPricingActive: boolean;
  listUnitPrice: number;
  catalogUnitPrice: number;
  listUnitPriceDisplay: string;
  catalogUnitPriceDisplay: string;
  tiers: readonly QuantityPricingTierRowViewModel[];
  currentTier: VariantQuantityPricingStateViewModel["currentTier"];
  state: VariantQuantityPricingStateViewModel;
}>;

export function variantHasQuantityPricingCatalog(
  variant: ProductVariantViewModel | null | undefined,
): boolean {
  const tiers = variant?.quantityPricingCatalog?.tiers;
  return Boolean(tiers && tiers.length > 0);
}

export function buildProductDetailQuantityPricingPresentation(input: {
  variant: ProductVariantViewModel;
  quantity: number;
  formatUnitPrice: (amount: number) => string;
}): ProductDetailQuantityPricingPresentation | null {
  const catalog = input.variant.quantityPricingCatalog;
  if (!catalog || catalog.tiers.length === 0) return null;

  const tiers = catalog.tiers.map((tier) => ({
    id: `t-${tier.minQuantity}`,
    minQuantity: tier.minQuantity,
    unitPrice: tier.unitPrice,
  }));

  const state = resolveVariantQuantityPricingState({
    listUnitPrice: catalog.listUnitPrice,
    quantity: input.quantity,
    tiers,
    maxPurchasableQuantity: input.variant.maxQuantity ?? null,
  });

  return {
    hasQuantityPricing: true,
    quantityPricingActive: state.quantityPricingActive,
    listUnitPrice: state.listUnitPrice,
    catalogUnitPrice: state.catalogUnitPrice,
    listUnitPriceDisplay: input.formatUnitPrice(state.listUnitPrice),
    catalogUnitPriceDisplay: input.formatUnitPrice(state.catalogUnitPrice),
    tiers: state.tiers,
    currentTier: state.currentTier,
    state,
  };
}
