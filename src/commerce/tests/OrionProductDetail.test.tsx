import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_PREVIEW_CAPABILITIES } from "@shopenlinea/commerce-runtime-contract";
import {
  ProductDetailCommerceView,
  createPayloadCommerceBridge,
  resolveNavHref,
  SHOP_PATH,
} from "jewelry-orion-v1/client";
import { createMockCommerceBridge } from "../mock/createMockCommerceBridge";
import defaults from "../../../templates/jewelry-orion-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/jewelry-orion-v1/src/lib/site-content";

const payload = defaults as never;

describe("Orion commerce parity", () => {
  it("keeps every product href inside /coleccion", async () => {
    const bridge = createPayloadCommerceBridge(payload);
    const { data } = await bridge.getListing();
    expect(data.products.length).toBeGreaterThan(0);
    for (const product of data.products) {
      expect(product.href.startsWith(`${SHOP_PATH}/`)).toBe(true);
    }

    const detail = await bridge.getDetail(data.products[0].slug);
    expect(detail?.href.startsWith(`${SHOP_PATH}/`)).toBe(true);
  });

  it("rewrites mock bridge hrefs to the Orion shop path", async () => {
    const bridge = createMockCommerceBridge("catalog-default", {
      shopPath: SHOP_PATH,
    });
    const { data } = await bridge.getProductListing({});
    for (const product of data.products) {
      expect(product.href.startsWith(`${SHOP_PATH}/`)).toBe(true);
    }
  });

  it("resolves shopFilter nav entries to /coleccion queries", () => {
    expect(
      resolveNavHref({
        type: "shopFilter",
        label: "Anillos",
        categorySlug: "anillos",
      }),
    ).toBe("/coleccion?categoria=anillos");
  });

  it("adds the selected quantity to the cart from the PDP", async () => {
    const user = userEvent.setup();
    const bridge = createPayloadCommerceBridge(payload);
    const slug = payload as unknown as { catalog: { products: { slug: string }[] } };
    const product = await bridge.getDetail(slug.catalog.products[0].slug);
    expect(product).not.toBeNull();
    const addToCart = vi.fn(async () => ({ ok: true as const }));
    const confirmAddToCartSuccess = vi.fn();

    render(
      <SiteContentProvider payload={payload} basePath="/t/orion">
        <ProductDetailCommerceView
          product={product!}
          capabilities={DEFAULT_PREVIEW_CAPABILITIES}
          actions={{
            selectVariant: bridge.actions.selectVariant,
            addToCart,
            openCartDrawer: vi.fn(),
            confirmAddToCartSuccess,
          }}
        />
      </SiteContentProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Más" }));
    await user.click(screen.getByRole("button", { name: /añadir al estuche/i }));

    expect(addToCart).toHaveBeenCalledWith(expect.any(String), 2);
    expect(confirmAddToCartSuccess).toHaveBeenCalled();
  });

  it("disables the CTA when the variant is out of stock", async () => {
    const bridge = createMockCommerceBridge("product-out-of-stock", {
      shopPath: SHOP_PATH,
    });
    const product = await bridge.getProductDetail("producto-agotado");

    render(
      <SiteContentProvider payload={payload} basePath="/t/orion">
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

    const cta = screen.getByRole("button", { name: /agotada/i });
    expect(cta).toBeDisabled();
  });
});
