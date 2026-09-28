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

  it("opens made-to-order upsell when quantity exceeds immediate stock cap", async () => {
    const user = userEvent.setup();
    const product = {
      id: "p1",
      slug: "ribbon",
      href: "/tienda/ribbon",
      name: "Ribbon",
      gallery: [{ id: "g1", url: "https://example.com/a.jpg", alt: "" }],
      variants: [
        {
          id: "v1",
          label: "Default",
          options: [],
          displayPrice: "10,00 €",
          available: true,
          maxQuantity: 2,
          immediateAvailableQty: 10,
          stockLabel: "available",
        },
      ],
      currency: "EUR",
      selectedVariantId: "v1",
      canAddToCart: true,
      madeToOrderUpsell: {
        productHref: "/tienda/ribbon?salesMode=madeToOrder",
        preparationPromiseLabel: "3–5 días",
      },
    };

    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <ProductDetailCommerceView
          product={product}
          capabilities={DEFAULT_PREVIEW_CAPABILITIES}
          actions={{
            selectVariant: vi.fn(),
            addToCart: vi.fn(async () => ({ ok: true })),
            openCartDrawer: vi.fn(),
          }}
        />
      </SiteContentProvider>,
    );

    const more = screen.getByRole("button", { name: "Más" });
    await user.click(more);
    await user.click(more);

    expect(
      screen.getByText(/Opciones de compra/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Solo tenemos 2 unidades para entrega inmediata/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /comprar bajo pedido/i })).toHaveAttribute(
      "href",
      "/t/atelier/tienda/ribbon?salesMode=madeToOrder",
    );
  });

  it("shows inline MTO panel when immediate stock is zero (Trigger B)", async () => {
    const product = {
      id: "p0",
      slug: "zero-stock",
      href: "/tienda/zero-stock",
      name: "Zero Stock",
      gallery: [{ id: "g1", url: "https://example.com/a.jpg", alt: "" }],
      variants: [
        {
          id: "v0",
          label: "Default",
          options: [],
          displayPrice: "10,00 €",
          available: true,
          maxQuantity: 0,
          immediateAvailableQty: 0,
          stockLabel: "out_of_stock",
        },
      ],
      currency: "EUR",
      selectedVariantId: "v0",
      canAddToCart: false,
      stockLabel: "out_of_stock",
      maxQuantity: 0,
      madeToOrderUpsell: {
        productHref: "/tienda/zero-stock?salesMode=madeToOrder",
        preparationPromiseLabel: "3–5 días",
      },
    };

    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <ProductDetailCommerceView
          product={product}
          capabilities={DEFAULT_PREVIEW_CAPABILITIES}
          actions={{
            selectVariant: vi.fn(),
            addToCart: vi.fn(async () => ({ ok: true })),
            openCartDrawer: vi.fn(),
          }}
        />
      </SiteContentProvider>,
    );

    expect(
      screen.getByText("Sin stock para entrega inmediata"),
    ).toBeInTheDocument();
    expect(screen.getByText("Disponible a pedido")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /comprar bajo pedido/i }),
    ).toHaveAttribute(
      "href",
      "/t/atelier/tienda/zero-stock?salesMode=madeToOrder",
    );
    expect(screen.queryByRole("button", { name: /agotado/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /añadir al carrito/i })).toBeNull();
  });

  it("enables Material Y when naive picker would deadlock on Color=Rojo", async () => {
    const user = userEvent.setup();
    const selectVariant = vi.fn();
    const product = {
      id: "p-mat",
      slug: "mat-color",
      href: "/tienda/mat-color",
      name: "Material Color",
      gallery: [{ id: "g1", url: "https://example.com/a.jpg", alt: "" }],
      variants: [
        {
          id: "mat-x-rojo",
          label: "Material X / Rojo",
          options: [
            { name: "Material", value: "Material X" },
            { name: "Color", value: "Rojo" },
          ],
          displayPrice: "100,00 €",
          available: true,
          maxQuantity: 5,
          stockLabel: "available",
        },
        {
          id: "mat-y-verde",
          label: "Material Y / Verde",
          options: [
            { name: "Material", value: "Material Y" },
            { name: "Color", value: "Verde" },
          ],
          displayPrice: "110,00 €",
          available: true,
          maxQuantity: 5,
          stockLabel: "available",
        },
        {
          id: "mat-y-amarillo",
          label: "Material Y / Amarillo",
          options: [
            { name: "Material", value: "Material Y" },
            { name: "Color", value: "Amarillo" },
          ],
          displayPrice: "115,00 €",
          available: true,
          maxQuantity: 5,
          stockLabel: "available",
        },
      ],
      currency: "EUR",
      selectedVariantId: "mat-x-rojo",
      canAddToCart: true,
      optionDefinitions: [
        { name: "Material", values: ["Material X", "Material Y"] },
        { name: "Color", values: ["Rojo", "Verde", "Amarillo"] },
      ],
    };

    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <ProductDetailCommerceView
          product={product}
          capabilities={DEFAULT_PREVIEW_CAPABILITIES}
          actions={{
            selectVariant,
            addToCart: vi.fn(async () => ({ ok: true })),
            openCartDrawer: vi.fn(),
          }}
        />
      </SiteContentProvider>,
    );

    const materialY = screen.getByRole("button", { name: "Material Y" });
    expect(materialY).not.toBeDisabled();
    await user.click(materialY);
    expect(selectVariant).toHaveBeenCalledWith("mat-y-verde");
  });
});
