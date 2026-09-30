import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderConfirmationView } from "fashion-atelier-v1/client";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";

describe("OrderConfirmationView", () => {
  it("renders line thumbnails when imageUrl is provided", () => {
    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <OrderConfirmationView
          order={{
            orderId: "ORD-100",
            statusLabel: "Confirmado",
            message: "Gracias por tu compra",
            totals: {
              subtotalDisplay: "480,00 €",
              totalDisplay: "480,00 €",
              currency: "EUR",
            },
            lines: [
              {
                lineId: "line_1",
                productName: "Abrigo cashmere",
                variantLabel: "M / Stone",
                quantity: 1,
                lineDisplayPrice: "480,00 €",
                imageUrl: "https://images.unsplash.com/photo-1?w=200",
              },
            ],
          }}
        />
      </SiteContentProvider>,
    );

    expect(screen.getByText("Gracias")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Abrigo cashmere" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("480,00 €").length).toBeGreaterThanOrEqual(1);
  });
});
