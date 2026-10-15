import { describe, expect, it } from "vitest";

import { buildProductDetailQuantityPricingDisclosureTiers } from "./productDetailQuantityPricingDisclosure";

describe("buildProductDetailQuantityPricingDisclosureTiers", () => {
  it("muestra umbrales 3–5 y 6+ aunque el catálogo traiga labels legacy", () => {
    const tiers = buildProductDetailQuantityPricingDisclosureTiers({
      listUnitPrice: 35,
      tiers: [
        {
          minQuantity: 3,
          unitPrice: 30,
          rangeLabel: "Compra 5 unidades",
        },
        {
          minQuantity: 6,
          unitPrice: 25,
          rangeLabel: "Compra 8 unidades",
        },
      ],
    });

    expect(tiers.map((tier) => tier.rangeLabel)).toEqual(["3–5", "6+"]);
  });
});
