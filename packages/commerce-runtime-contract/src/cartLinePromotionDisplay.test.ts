import { describe, expect, it } from "vitest";

import type { CartLineViewModel } from "./cart";
import {
  cartLinePromotionLabels,
  formatCartLinePromotionDisplay,
} from "./cartPricingPresentation";

function line(
  adjustments: CartLineViewModel["pricingAdjustments"],
): CartLineViewModel {
  return {
    lineId: "l1",
    href: "/p",
    variantId: "v1",
    productId: "p1",
    productName: "P",
    variantLabel: "M",
    quantity: 1,
    unitDisplayPrice: "US$10.00",
    lineDisplayPrice: "US$10.00",
    imageUrl: null,
    maxQuantity: null,
    pricingAdjustments: adjustments,
  };
}

describe("formatCartLinePromotionDisplay", () => {
  it("T10: una promo — label único", () => {
    const display = formatCartLinePromotionDisplay(
      line([{ sourceId: "p1", label: "10% off", kind: "promotion", amountDisplay: null }]),
    );
    expect(display?.compactText).toBe("10% off");
    expect(display?.promotionCount).toBe(1);
  });

  it("T10: dos promos — compactText incluye ambas etiquetas", () => {
    const cartLine = line([
      { sourceId: "p1", label: "Promo A", kind: "promotion", amountDisplay: null },
      { sourceId: "p2", label: "Promo B", kind: "promotion", amountDisplay: null },
    ]);
    const display = formatCartLinePromotionDisplay(cartLine);
    expect(cartLinePromotionLabels(cartLine)).toEqual(["Promo A", "Promo B"]);
    expect(display?.compactText).toBe("Promo A · Promo B");
    expect(display?.promotionCount).toBe(2);
  });
});
