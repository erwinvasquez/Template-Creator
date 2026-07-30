import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_PREVIEW_CAPABILITIES } from "@shopenlinea/commerce-runtime-contract";
import { ProductDetailCommerceView } from "fashion-atelier-v1/client";
import { createMockCommerceBridge } from "../mock/createMockCommerceBridge";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";

describe("ProductDetailCommerceView", () => {
  it("adds selected quantity to cart", async () => {
    const user = userEvent.setup();
    const bridge = createMockCommerceBridge("product-variants");
    const product = await bridge.getProductDetail("abrigo-cashmere-stone");
    expect(product).not.toBeNull();
    const addToCart = vi.fn(async () => ({ ok: true as const }));
    const openCartDrawer = vi.fn();

    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <ProductDetailCommerceView
          product={product!}
          capabilities={DEFAULT_PREVIEW_CAPABILITIES}
          actions={{
            selectVariant: bridge.actions.selectVariant,
            addToCart,
            openCartDrawer,
          }}
        />
      </SiteContentProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Más" }));
    await user.click(screen.getByRole("button", { name: /añadir al carrito/i }));

    expect(addToCart).toHaveBeenCalledWith(expect.any(String), 2);
    expect(openCartDrawer).toHaveBeenCalled();
  });

  it("shows compare-at price and sale percent", async () => {
    const bridge = createMockCommerceBridge("product-variants");
    const product = await bridge.getProductDetail("abrigo-cashmere-stone");

    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <ProductDetailCommerceView
          product={product!}
          capabilities={DEFAULT_PREVIEW_CAPABILITIES}
          actions={{
            selectVariant: bridge.actions.selectVariant,
            addToCart: vi.fn(async () => ({ ok: true })),
            openCartDrawer: vi.fn(),
          }}
        />
      </SiteContentProvider>,
    );

    expect(screen.getByText("480,00 €")).toBeInTheDocument();
    expect(screen.getAllByText("−12%").length).toBeGreaterThanOrEqual(1);
  });

  it("disables CTA when out of stock", async () => {
    const bridge = createMockCommerceBridge("product-out-of-stock");
    const product = await bridge.getProductDetail("producto-agotado");

    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <ProductDetailCommerceView
          product={product!}
          capabilities={DEFAULT_PREVIEW_CAPABILITIES}
          actions={{
            selectVariant: bridge.actions.selectVariant,
            addToCart: vi.fn(async () => ({ ok: true })),
            openCartDrawer: vi.fn(),
          }}
        />
      </SiteContentProvider>,
    );

    const cta = screen.getByRole("button", { name: /agotado/i });
    expect(cta).toBeDisabled();
  });
});
