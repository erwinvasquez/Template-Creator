import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderTrackingView } from "fashion-atelier-v1/client";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";
import { createMockOrderTrackingViewModel } from "../mock/createMockOrderTrackingViewModel";

describe("OrderTrackingView", () => {
  it("renders status headline and order number from host viewModel", () => {
    const tracking = createMockOrderTrackingViewModel();

    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <OrderTrackingView tracking={tracking} />
      </SiteContentProvider>,
    );

    expect(screen.getByText("Pedido en preparación")).toBeInTheDocument();
    expect(screen.getByText("ORD-100")).toBeInTheDocument();
    expect(screen.getByText("Atelier Demo")).toBeInTheDocument();
    expect(screen.getByText("Pedido recibido")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Abrigo cashmere" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /seguir comprando/i }),
    ).toHaveAttribute("href", "/tienda");
  });

  it("does not fetch — only displays props", () => {
    const tracking = createMockOrderTrackingViewModel({
      statusHeadline: "Entregado",
      orderNumber: "ORD-999",
    });

    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <OrderTrackingView tracking={tracking} />
      </SiteContentProvider>,
    );

    expect(screen.getByText("Entregado")).toBeInTheDocument();
    expect(screen.getByText("ORD-999")).toBeInTheDocument();
  });
});
