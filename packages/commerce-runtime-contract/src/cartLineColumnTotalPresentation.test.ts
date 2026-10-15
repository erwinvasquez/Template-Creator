import { describe, expect, it } from "vitest";

import type { CartLineViewModel } from "./cart";
import { resolveCartLineColumnTotalPresentation } from "./cartPricingPresentation";

function qtyLine(
  partial: Partial<CartLineViewModel> & Pick<CartLineViewModel, "quantity" | "lineDisplayPrice">,
): CartLineViewModel {
  return {
    lineId: "l1",
    variantId: "v1",
    productId: "p1",
    productName: "P",
    variantLabel: "V",
    href: "/p",
    imageUrl: null,
    unitDisplayPrice: "30,00 BOB",
    lineFinalTotal: partial.lineFinalTotal ?? 90,
    ...partial,
  };
}

describe("resolveCartLineColumnTotalPresentation", () => {
  it("quantity + promo => 105 tachado / 85.50 final", () => {
    const pres = resolveCartLineColumnTotalPresentation(
      qtyLine({
        quantity: 3,
        lineDisplayPrice: "85,50 BOB",
        lineFinalTotal: 85.5,
        lineListOriginalTotal: 105,
        lineListOriginalTotalDisplay: "105,00 BOB",
        quantityPricing: {
          listUnitPrice: 35,
          catalogUnitPrice: 30,
          appliedTierMinQuantity: 3,
          lineLabel: "Precio por cantidad · 3+ unidades",
          listUnitPriceDisplay: "35,00 BOB",
          catalogUnitPriceDisplay: "30,00 BOB",
        },
      }),
    );
    expect(pres.originalLineTotalDisplay).toBe("105,00 BOB");
    expect(pres.finalLineTotalDisplay).toBe("85,50 BOB");
  });

  it("solo quantity => 105 / 90", () => {
    const pres = resolveCartLineColumnTotalPresentation(
      qtyLine({
        quantity: 3,
        lineDisplayPrice: "90,00 BOB",
        lineFinalTotal: 90,
        lineListOriginalTotalDisplay: "105,00 BOB",
        quantityPricing: {
          listUnitPrice: 35,
          catalogUnitPrice: 30,
          appliedTierMinQuantity: 3,
          lineLabel: "Precio por cantidad · 3+ unidades",
        },
      }),
    );
    expect(pres.originalLineTotalDisplay).toBe("105,00 BOB");
    expect(pres.finalLineTotalDisplay).toBe("90,00 BOB");
  });

  it("solo promo => comportamiento histórico lineOriginalDisplayPrice", () => {
    const pres = resolveCartLineColumnTotalPresentation(
      qtyLine({
        quantity: 2,
        lineDisplayPrice: "112,50 BOB",
        lineFinalTotal: 112.5,
        lineOriginalTotal: 150,
        lineOriginalDisplayPrice: "150,00 BOB",
      }),
    );
    expect(pres.originalLineTotalDisplay).toBe("150,00 BOB");
    expect(pres.finalLineTotalDisplay).toBe("112,50 BOB");
  });

  it("sin descuento => sin compare", () => {
    const pres = resolveCartLineColumnTotalPresentation(
      qtyLine({
        quantity: 1,
        lineDisplayPrice: "35,00 BOB",
        lineFinalTotal: 35,
        lineListOriginalTotal: 35,
        lineListOriginalTotalDisplay: "35,00 BOB",
      }),
    );
    expect(pres.originalLineTotalDisplay).toBeNull();
    expect(pres.finalLineTotalDisplay).toBe("35,00 BOB");
  });

  it("múltiples cantidades sin tier label no fuerza compare lista", () => {
    const pres = resolveCartLineColumnTotalPresentation(
      qtyLine({
        quantity: 5,
        lineDisplayPrice: "175,00 BOB",
        lineFinalTotal: 175,
        lineListOriginalTotal: 175,
        lineListOriginalTotalDisplay: "175,00 BOB",
      }),
    );
    expect(pres.originalLineTotalDisplay).toBeNull();
  });
});
