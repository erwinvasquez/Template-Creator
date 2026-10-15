import { describe, expect, it } from "vitest";

import { buildOrderConfirmationSummaryRows } from "./orderConfirmationPresentation";

const labels = {
  subtotalOriginal: "Subtotal original",
  subtotal: "Subtotal",
  quantityDiscounts: "Descuentos por cantidad",
  promotions: "Promociones",
  shipping: "Envío",
  shippingPending: "A cotizar",
  tax: "Impuestos",
  total: "Total",
};

describe("buildOrderConfirmationSummaryRows", () => {
  it("quantity + promo muestra desglose completo", () => {
    const rows = buildOrderConfirmationSummaryRows(
      {
        subtotalDisplay: "105,00 BOB",
        quantityDiscountDisplay: "15,00 BOB",
        discountDisplay: "4,50 BOB",
        shippingDisplay: "0,00 BOB",
        taxDisplay: null,
        totalDisplay: "85,50 BOB",
        currency: "BOB",
      },
      labels,
    );

    expect(rows.map((r) => r.key)).toEqual([
      "subtotal-original",
      "quantity-discount",
      "promotion-discount",
      "shipping",
      "total",
    ]);
  });

  it("no muestra filas quantity/promo cuando vienen null", () => {
    const rows = buildOrderConfirmationSummaryRows(
      {
        subtotalDisplay: "50,00 BOB",
        quantityDiscountDisplay: null,
        discountDisplay: null,
        shippingDisplay: null,
        taxDisplay: null,
        totalDisplay: "50,00 BOB",
        currency: "BOB",
      },
      labels,
    );

    expect(rows.some((r) => r.key === "quantity-discount")).toBe(false);
    expect(rows.some((r) => r.key === "promotion-discount")).toBe(false);
    expect(rows[0]?.key).toBe("subtotal");
  });
});
