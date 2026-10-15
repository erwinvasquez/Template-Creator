import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { OrderConfirmationStandardView } from "./orderConfirmationViews";

const baseProps = {
  order: {
    orderId: "ORD-1",
    statusLabel: "Recibido",
    message: "Gracias por tu compra. Hemos registrado tu pedido.",
    lines: [
      {
        lineId: "l1",
        productName: "Producto",
        variantLabel: "M",
        quantity: 3,
        lineDisplayPrice: "85,50 BOB",
        compareAtDisplay: "105,00 BOB",
        imageUrl: null,
      },
    ],
    totals: {
      subtotalDisplay: "105,00 BOB",
      quantityDiscountDisplay: "15,00 BOB",
      discountDisplay: "4,50 BOB",
      shippingDisplay: null,
      taxDisplay: null,
      totalDisplay: "85,50 BOB",
      currency: "BOB",
    },
  },
  summaryLabels: {
    subtotalOriginal: "Subtotal original",
    subtotal: "Subtotal",
    quantityDiscounts: "Descuentos por cantidad",
    promotions: "Promociones",
    shipping: "Envío",
    shippingPending: "A cotizar",
    tax: "Impuestos",
    total: "Total",
  },
  actions: {
    trackingHref: "/tracking",
    continueShoppingHref: "/shop",
    trackingLabel: "Seguimiento del pedido",
    continueShoppingLabel: "Seguir comprando",
  },
};

describe("OrderConfirmationStandardView", () => {
  it("usa H1 Pedido confirmado sin kicker previo", () => {
    const html = renderToStaticMarkup(<OrderConfirmationStandardView {...baseProps} />);

    expect(html).toContain("Pedido confirmado");
    expect(html).not.toMatch(/uppercase[^>]*>Pedido confirmado/);
    expect(html).toContain("Gracias por tu compra");
    expect(html).toContain("105,00 BOB");
    expect(html).toContain("Descuentos por cantidad");
    expect(html).toContain("Seguimiento del pedido");
    expect(html).toContain("Seguir comprando");
  });

  it("muestra los componentes congelados del kit", () => {
    const html = renderToStaticMarkup(
      <OrderConfirmationStandardView
        {...baseProps}
        summaryLabels={{ ...baseProps.summaryLabels, kitIncludes: "Includes" }}
        order={{
          ...baseProps.order,
          lines: [
            {
              ...baseProps.order.lines[0]!,
              productName: "KIT 2",
              variantLabel: "Combo Mediano",
              quantity: 1,
              kitIncludes: [
                { label: "Papas — Medianas", quantity: 1 },
                { label: "Gaseosa — Mediana", quantity: 1 },
              ],
            },
          ],
        }}
      />,
    );
    expect(html).toContain("KIT 2");
    expect(html).toContain("Combo Mediano");
    expect(html).toContain("Includes");
    expect(html).toContain("Papas");
    expect(html).toContain("Medianas × 1");
    expect(html).toContain("Gaseosa");
  });

  it("muestra total de línea tachado solo cuando compareAtDisplay existe", () => {
    const html = renderToStaticMarkup(<OrderConfirmationStandardView {...baseProps} />);
    expect(html).toContain("line-through");
    expect(html).toContain("85,50 BOB");
  });
});
