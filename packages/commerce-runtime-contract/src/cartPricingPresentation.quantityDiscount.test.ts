import { describe, expect, it } from "vitest";

import type { CartViewModel } from "./cart";
import { buildCartSummaryRows } from "./cartPricingPresentation";
import { defaultCartPricingUiLabels } from "./cartPricingViews";

const labels = defaultCartPricingUiLabels({});

function cart(partial: Partial<CartViewModel>): CartViewModel {
  return {
    cartId: "c1",
    salesMode: "stock",
    currency: "BOB",
    itemsCount: 1,
    subtotal: 90,
    subtotalDisplay: "90,00 BOB",
    requiresShipping: true,
    estimatedTotal: true,
    pricingStatus: "confirmed",
    lines: [],
    cartHref: "/cart",
    checkoutHref: "/checkout",
    ...partial,
  };
}

describe("buildCartSummaryRows quantity discount", () => {
  it("A: sin descuentos → solo subtotal, sin quantity ni promo", () => {
    const rows = buildCartSummaryRows(
      cart({
        subtotalDisplay: "35,00 BOB",
        quantityDiscountTotal: 0,
        discountTotal: 0,
      }),
      labels,
      "drawer",
    );
    expect(rows.map((r) => r.key)).toEqual(["subtotal"]);
  });

  it("B: solo quantity → original 105, quantity -15", () => {
    const rows = buildCartSummaryRows(
      cart({
        subtotalOriginal: 105,
        subtotalOriginalDisplay: "105,00 BOB",
        quantityDiscountTotal: 15,
        quantityDiscountTotalDisplay: "15,00 BOB",
        discountTotal: 0,
        subtotalPromotional: 90,
        subtotalPromotionalDisplay: "90,00 BOB",
      }),
      labels,
      "drawer",
    );
    expect(rows.map((r) => r.key)).toEqual(["subtotal-original", "quantity-discount"]);
    expect(rows.find((r) => r.key === "quantity-discount")?.label).toBe(
      "Descuentos por cantidad",
    );
    expect(rows.find((r) => r.key === "quantity-discount")?.value).toBe("−15,00 BOB");
    expect(rows.some((r) => r.key === "discount")).toBe(false);
  });

  it("C: quantity + promo → 105 / -15 / -4.50", () => {
    const rows = buildCartSummaryRows(
      cart({
        subtotalOriginal: 105,
        subtotalOriginalDisplay: "105,00 BOB",
        quantityDiscountTotal: 15,
        quantityDiscountTotalDisplay: "15,00 BOB",
        discountTotal: 4.5,
        discountTotalDisplay: "4,50 BOB",
        subtotalPromotional: 85.5,
        subtotalPromotionalDisplay: "85,50 BOB",
      }),
      labels,
      "drawer",
    );
    expect(rows.map((r) => r.key)).toEqual([
      "subtotal-original",
      "quantity-discount",
      "discount",
    ]);
    expect(rows.find((r) => r.key === "discount")?.label).toBe("Promociones");
  });

  it("D: promo-only → sin quantity discount row", () => {
    const rows = buildCartSummaryRows(
      cart({
        subtotalOriginal: 150,
        subtotalOriginalDisplay: "150,00 BOB",
        quantityDiscountTotal: 0,
        discountTotal: 37.5,
        discountTotalDisplay: "37,50 BOB",
        subtotalPromotional: 112.5,
        subtotalPromotionalDisplay: "112,50 BOB",
      }),
      labels,
      "drawer",
    );
    expect(rows.some((r) => r.key === "quantity-discount")).toBe(false);
    expect(rows.some((r) => r.key === "discount")).toBe(true);
  });

  it("oculta quantity y promo cuando ambos están en el epsilon", () => {
    const rows = buildCartSummaryRows(
      cart({
        quantityDiscountTotal: 0.005,
        quantityDiscountTotalDisplay: "0,01 BOB",
        discountTotal: 0.005,
        discountTotalDisplay: "0,01 BOB",
      }),
      labels,
      "drawer",
    );

    expect(rows.map((row) => row.key)).toEqual(["subtotal"]);
  });
});
