import { describe, expect, it } from "vitest";

import type { CartViewModel } from "./cart";
import { buildCartSummaryRows } from "./cartPricingPresentation";
import { defaultCartPricingUiLabels } from "./cartPricingViews";

function cartWithPendingShipping(): CartViewModel {
  return {
    cartId: "cart-1",
    salesMode: "stock",
    currency: "USD",
    itemsCount: 1,
    subtotal: 100,
    subtotalDisplay: "US$100.00",
    requiresShipping: true,
    estimatedTotal: true,
    lines: [],
    pricingStatus: "idle",
    cartHref: "/carrito",
    checkoutHref: "/checkout",
  };
}

describe("buildCartSummaryRows — envío pendiente", () => {
  it("español: label Envío y valor Por calcular", () => {
    const labels = defaultCartPricingUiLabels({
      shipping: "Envío",
      shippingPending: "Por calcular",
    });
    const rows = buildCartSummaryRows(cartWithPendingShipping(), labels);
    const shippingRow = rows.find((row) => row.key === "shipping");

    expect(shippingRow?.label).toBe("Envío");
    expect(shippingRow?.value).toBe("Por calcular");
    expect(shippingRow?.label).not.toBe(shippingRow?.value);
  });

  it("inglés: label Shipping y valor To be calculated", () => {
    const labels = defaultCartPricingUiLabels({
      shipping: "Shipping",
      shippingPending: "To be calculated",
    });
    const rows = buildCartSummaryRows(cartWithPendingShipping(), labels);
    const shippingRow = rows.find((row) => row.key === "shipping");

    expect(shippingRow?.label).toBe("Shipping");
    expect(shippingRow?.value).toBe("To be calculated");
    expect(shippingRow?.label).not.toBe(shippingRow?.value);
  });

  it("no duplica Por calcular en label y value con defaults españoles", () => {
    const labels = defaultCartPricingUiLabels({
      shippingPending: "Por calcular",
    });
    const rows = buildCartSummaryRows(cartWithPendingShipping(), labels);
    const shippingRow = rows.find((row) => row.key === "shipping");

    expect(shippingRow?.label).toBe("Envío");
    expect(shippingRow?.value).toBe("Por calcular");
    expect(
      rows.every(
        (row) => !(row.key === "shipping" && row.label === "Por calcular" && row.value === "Por calcular"),
      ),
    ).toBe(true);
  });
});
