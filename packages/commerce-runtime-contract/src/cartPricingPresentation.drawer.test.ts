import { describe, expect, it } from "vitest";

import type { CartViewModel } from "./cart";
import { buildCartSummaryRows } from "./cartPricingPresentation";
import { defaultCartPricingUiLabels } from "./cartPricingViews";

const labels = defaultCartPricingUiLabels({});

const cart = {
  lines: [],
  subtotalDisplay: "$100",
  subtotalOriginalDisplay: "$120",
  subtotalPromotionalDisplay: "$100",
  discountTotalDisplay: "$20",
  discountTotal: 20,
  currency: "USD",
  requiresShipping: true,
  estimatedTotal: true,
  pricingStatus: "confirmed",
  salesMode: "stock",
  cartId: "c1",
  itemsCount: 0,
  subtotal: 100,
  cartHref: "/cart",
  checkoutHref: "/checkout",
} satisfies CartViewModel;

describe("buildCartSummaryRows drawer presentation", () => {
  it("hides promotional subtotal and shipping in drawer", () => {
    const rows = buildCartSummaryRows(cart, labels, "drawer");
    expect(rows.some((r) => r.key === "subtotal-promotional")).toBe(false);
    expect(rows.some((r) => r.key === "shipping")).toBe(false);
  });

  it("keeps full rows in full presentation", () => {
    const rows = buildCartSummaryRows(cart, labels, "full");
    expect(rows.some((r) => r.key === "subtotal-promotional")).toBe(true);
    expect(rows.some((r) => r.key === "shipping")).toBe(true);
  });
});
