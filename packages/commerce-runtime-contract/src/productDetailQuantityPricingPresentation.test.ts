import { describe, expect, it } from "vitest";

import type { ProductVariantViewModel } from "./product";
import {
  buildProductDetailQuantityPricingPresentation,
  variantHasQuantityPricingCatalog,
} from "./productDetailQuantityPricingPresentation";

const format = (n: number) => `${n.toFixed(2)} BOB`;

function variantWithTiers(): ProductVariantViewModel {
  return {
    id: "v1",
    label: "Default",
    available: true,
    displayPrice: "35,00 BOB",
    quantityPricingCatalog: {
      listUnitPrice: 35,
      tiers: [
        { minQuantity: 3, unitPrice: 30, rangeLabel: "3–5" },
        { minQuantity: 6, unitPrice: 25, rangeLabel: "6+" },
      ],
    },
  } as unknown as ProductVariantViewModel;
}

describe("variantHasQuantityPricingCatalog", () => {
  it("T1: sin tiers → false", () => {
    expect(variantHasQuantityPricingCatalog({ id: "x" } as ProductVariantViewModel)).toBe(
      false,
    );
  });

  it("T2: con tiers → true", () => {
    expect(variantHasQuantityPricingCatalog(variantWithTiers())).toBe(true);
  });
});

describe("buildProductDetailQuantityPricingPresentation", () => {
  it("T2 qty1: list visible, tier inactivo", () => {
    const p = buildProductDetailQuantityPricingPresentation({
      variant: variantWithTiers(),
      quantity: 1,
      formatUnitPrice: format,
    });
    expect(p?.quantityPricingActive).toBe(false);
    expect(p?.listUnitPriceDisplay).toBe("35.00 BOB");
    expect(p?.catalogUnitPriceDisplay).toBe("35.00 BOB");
  });

  it("T3 qty3: list tachado semántico + catalog 30", () => {
    const p = buildProductDetailQuantityPricingPresentation({
      variant: variantWithTiers(),
      quantity: 3,
      formatUnitPrice: format,
    });
    expect(p?.quantityPricingActive).toBe(true);
    expect(p?.catalogUnitPrice).toBe(30);
    expect(p?.listUnitPrice).toBe(35);
  });

  it("T4 qty6: catalog 25", () => {
    const p = buildProductDetailQuantityPricingPresentation({
      variant: variantWithTiers(),
      quantity: 6,
      formatUnitPrice: format,
    });
    expect(p?.catalogUnitPrice).toBe(25);
    expect(p?.state.nextTier).toBeNull();
  });

  it("T6: variante sin catálogo → null", () => {
    const p = buildProductDetailQuantityPricingPresentation({
      variant: { id: "x" } as ProductVariantViewModel,
      quantity: 1,
      formatUnitPrice: format,
    });
    expect(p).toBeNull();
  });
});
