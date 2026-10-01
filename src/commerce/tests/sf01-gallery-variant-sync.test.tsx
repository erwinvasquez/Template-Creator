import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PREVIEW_CAPABILITIES,
  type ProductDetailViewModel,
} from "@shopenlinea/commerce-runtime-contract";
import { ProductDetailCommerceView } from "fashion-atelier-v1/client";
import { ProductDetailCommerceView as FoodDetail } from "food-patisserie-v1/client";
import { ProductDetailCommerceView as OrionDetail } from "jewelry-orion-v1/client";
import defaultsAtelier from "../../../templates/fashion-atelier-v1/defaults.json";
import defaultsFood from "../../../templates/food-patisserie-v1/defaults.json";
import defaultsOrion from "../../../templates/jewelry-orion-v1/defaults.json";
import { SiteContentProvider as AtelierProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";
import { SiteContentProvider as FoodProvider } from "../../../templates/food-patisserie-v1/src/lib/site-content";
import { SiteContentProvider as OrionProvider } from "../../../templates/jewelry-orion-v1/src/lib/site-content";
import { createMockCommerceBridge } from "../mock/createMockCommerceBridge";

const BLUE = "v-blue-silk";

function mergeProductWithSelectedVariant(
  product: ProductDetailViewModel,
  localSelectedVariantId: string | null,
): ProductDetailViewModel {
  const effectiveId = localSelectedVariantId ?? product.selectedVariantId;
  if (!effectiveId || product.selectedVariantId === effectiveId) return product;
  return { ...product, selectedVariantId: effectiveId };
}

function Sf01Host({ View }: { View: typeof ProductDetailCommerceView }) {
  const bridge = createMockCommerceBridge("sf01-gallery-variant");
  const [product, setProduct] = useState<ProductDetailViewModel | null>(null);
  const [localVariantId, setLocalVariantId] = useState<string | null>(null);

  if (!product) {
    void bridge.getProductDetail("sf01-gallery-sync").then((p) => {
      setProduct(p);
      setLocalVariantId(p?.selectedVariantId ?? null);
    });
    return null;
  }

  const merged = mergeProductWithSelectedVariant(product, localVariantId);

  return (
    <View
      product={merged}
      capabilities={DEFAULT_PREVIEW_CAPABILITIES}
      actions={{
        selectVariant(id) {
          setLocalVariantId(id);
          bridge.actions.selectVariant(id);
        },
        addToCart: vi.fn(async () => ({ ok: true as const })),
        openCartDrawer: vi.fn(),
        confirmAddToCartSuccess: vi.fn(),
      }}
    />
  );
}

describe("SF-01 gallery → variant sync", () => {
  it("atelier: pulsar imagen celeste actualiza controles y add-to-cart usa variante B", async () => {
    const user = userEvent.setup();
    const addToCart = vi.fn(async () => ({ ok: true as const }));

    function Host() {
      const bridge = createMockCommerceBridge("sf01-gallery-variant");
      const [product, setProduct] = useState<ProductDetailViewModel | null>(
        null,
      );
      const [localVariantId, setLocalVariantId] = useState<string | null>(
        null,
      );

      if (!product) {
        void bridge.getProductDetail("sf01-gallery-sync").then((p) => {
          setProduct(p);
          setLocalVariantId(p?.selectedVariantId ?? null);
        });
        return null;
      }

      const merged = mergeProductWithSelectedVariant(product, localVariantId);

      return (
        <AtelierProvider payload={defaultsAtelier as never} basePath="/t/atelier">
          <ProductDetailCommerceView
            product={merged}
            capabilities={DEFAULT_PREVIEW_CAPABILITIES}
            actions={{
              selectVariant(id) {
                setLocalVariantId(id);
              },
              addToCart,
              openCartDrawer: vi.fn(),
              confirmAddToCartSuccess: vi.fn(),
            }}
          />
        </AtelierProvider>
      );
    }

    render(<Host />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /celeste/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Imagen 2" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /celeste/i })).toHaveClass(
        "border-primary",
      );
    });

    await user.click(screen.getByRole("button", { name: /añadir al carrito/i }));
    expect(addToCart).toHaveBeenCalledWith(BLUE, 1);
  });

  it("food patisserie: imagen general no cambia variante seleccionada", async () => {
    const user = userEvent.setup();
    let lastVariantId: string | null = null;

    function Host() {
      const bridge = createMockCommerceBridge("sf01-gallery-variant");
      const [product, setProduct] = useState<ProductDetailViewModel | null>(
        null,
      );
      const [localVariantId, setLocalVariantId] = useState<string | null>(
        null,
      );

      if (!product) {
        void bridge.getProductDetail("sf01-gallery-sync").then((p) => {
          setProduct(p);
          setLocalVariantId(p?.selectedVariantId ?? null);
        });
        return null;
      }

      lastVariantId = localVariantId;
      const merged = mergeProductWithSelectedVariant(product, localVariantId);

      return (
        <FoodProvider payload={defaultsFood as never} basePath="/t/patisserie">
          <FoodDetail
            product={merged}
            capabilities={DEFAULT_PREVIEW_CAPABILITIES}
            actions={{
              selectVariant(id) {
                setLocalVariantId(id);
              },
              addToCart: vi.fn(async () => ({ ok: true })),
              openCartDrawer: vi.fn(),
              confirmAddToCartSuccess: vi.fn(),
            }}
          />
        </FoodProvider>
      );
    }

    render(<Host />);
    await waitFor(() => screen.getByRole("button", { name: "Imagen 3" }));
    const before = lastVariantId;
    await user.click(screen.getByRole("button", { name: "Imagen 3" }));
    expect(lastVariantId).toBe(before);
  });

  it("orion: opción → imagen sigue activa tras cambiar color", async () => {
    const user = userEvent.setup();

    render(
      <OrionProvider payload={defaultsOrion as never} basePath="/t/orion">
        <Sf01Host View={OrionDetail} />
      </OrionProvider>,
    );

    await waitFor(() => screen.getByRole("button", { name: "Imagen 1" }));
    await user.click(screen.getByRole("button", { name: /celeste/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Imagen 2" })).toHaveClass(
        "border-primary",
      );
    });
  });
});
