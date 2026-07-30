import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceCartDrawer } from "fashion-atelier-v1/client";
import { createMockCommerceBridge } from "../mock/createMockCommerceBridge";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";

describe("CommerceCartDrawer", () => {
  it("empty cart snapshot", async () => {
    const bridge = createMockCommerceBridge("cart-empty");
    const cart = await bridge.getCart();

    const { container } = render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <CommerceCartDrawer
          cart={cart}
          isOpen
          onClose={() => undefined}
          actions={{
            updateCartQuantity: bridge.actions.updateCartQuantity,
            removeCartLine: bridge.actions.removeCartLine,
            clearCart: bridge.actions.clearCart,
            navigateToCheckout: bridge.actions.navigateToCheckout,
            openCartDrawer: bridge.actions.openCartDrawer,
          }}
        />
      </SiteContentProvider>,
    );

    expect(screen.getByText(/vacío/i)).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it("promotion cart shows label and lines", async () => {
    const bridge = createMockCommerceBridge("cart-promotion");
    const cart = await bridge.getCart();

    const { container } = render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <CommerceCartDrawer
          cart={cart}
          isOpen
          onClose={() => undefined}
          actions={{
            updateCartQuantity: bridge.actions.updateCartQuantity,
            removeCartLine: bridge.actions.removeCartLine,
            clearCart: bridge.actions.clearCart,
            navigateToCheckout: bridge.actions.navigateToCheckout,
            openCartDrawer: bridge.actions.openCartDrawer,
          }}
        />
      </SiteContentProvider>,
    );

    expect(screen.getByText(/bienvenida/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /finalizar compra/i }),
    ).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
