import { describe, expect, it } from "vitest";

import {
  buildQuantityPricingTierRows,
  cartLineHasQuantityPricing,
  resolveVariantQuantityPricingState,
} from "./quantityPricingPresentation";

const tiers = [
  { id: "t3", minQuantity: 3, unitPrice: 30 },
  { id: "t6", minQuantity: 6, unitPrice: 25 },
];

describe("resolveVariantQuantityPricingState", () => {
  it("T2: qty1 list35 sin tier aplicado, next tier 3", () => {
    const state = resolveVariantQuantityPricingState({
      listUnitPrice: 35,
      quantity: 1,
      tiers,
    });
    expect(state.catalogUnitPrice).toBe(35);
    expect(state.quantityPricingActive).toBe(false);
    expect(state.nextTier?.minQuantity).toBe(3);
    expect(state.nextTier?.remainingQuantity).toBe(2);
  });

  it("T3: qty3 tier 30, next 3 más para 25", () => {
    const state = resolveVariantQuantityPricingState({
      listUnitPrice: 35,
      quantity: 3,
      tiers,
    });
    expect(state.catalogUnitPrice).toBe(30);
    expect(state.quantityPricingActive).toBe(true);
    expect(state.nextTier?.remainingQuantity).toBe(3);
    expect(state.nextTier?.unitPrice).toBe(25);
  });

  it("T4: qty6 último tier sin progreso", () => {
    const state = resolveVariantQuantityPricingState({
      listUnitPrice: 35,
      quantity: 6,
      tiers,
    });
    expect(state.catalogUnitPrice).toBe(25);
    expect(state.nextTier).toBeNull();
  });

  it("T9: next tier > maxPurchasable no muestra progreso", () => {
    const state = resolveVariantQuantityPricingState({
      listUnitPrice: 35,
      quantity: 3,
      tiers,
      maxPurchasableQuantity: 5,
    });
    expect(state.nextTier).toBeNull();
  });
});

describe("buildQuantityPricingTierRows", () => {
  it("formatea rangos 3+ y 6+", () => {
    const rows = buildQuantityPricingTierRows(tiers);
    expect(rows.map((r) => r.rangeLabel)).toEqual(["3–5", "6+"]);
  });

  it("ignora labels legacy y usa minQuantity real", () => {
    const rows = buildQuantityPricingTierRows([
      {
        id: "t3",
        minQuantity: 3,
        unitPrice: 30,
        label: "Compra 5 unidades",
      },
      {
        id: "t6",
        minQuantity: 6,
        unitPrice: 25,
        label: "Compra 8 unidades",
      },
    ]);
    expect(rows.map((r) => r.rangeLabel)).toEqual(["3–5", "6+"]);
  });
});

describe("cartLineHasQuantityPricing", () => {
  it("detecta list > catalog", () => {
    expect(
      cartLineHasQuantityPricing({ listUnitPrice: 35, catalogUnitPrice: 30 }),
    ).toBe(true);
  });
});
