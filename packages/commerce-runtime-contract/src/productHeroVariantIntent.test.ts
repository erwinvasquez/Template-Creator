import { describe, expect, it, vi } from "vitest";
import type { ProductDetailViewModel } from "./product";
import {
  PRODUCT_HERO_WARM_LIMIT,
  createProductHeroWarmSession,
  productHeroSourceUrlForVariant,
  productHeroWarmRequestForVariant,
  type ProductHeroWarmRequest,
} from "./productHeroVariantIntent";

function request(key: string): ProductHeroWarmRequest {
  return {
    key,
    src: `https://img.example/${key}?w=750&q=75`,
    srcSet: `https://img.example/${key}?w=750&q=75 750w`,
    sizes: "(max-width: 768px) 100vw, 50vw",
  };
}

function product(): ProductDetailViewModel {
  return {
    id: "p1",
    slug: "s",
    href: "/h",
    name: "N",
    gallery: [
      { id: "g1", url: "https://x/red", variantId: "red" },
      { id: "g2", url: "https://x/blue", variantId: "blue" },
    ],
    variants: [
      {
        id: "red",
        label: "Rojo",
        options: [{ name: "Color", value: "Rojo" }],
        displayPrice: "1",
        available: true,
        maxQuantity: 1,
        imageUrl: "https://x/red",
      },
      {
        id: "blue",
        label: "Azul",
        options: [{ name: "Color", value: "Azul" }],
        displayPrice: "2",
        available: true,
        maxQuantity: 1,
        imageUrl: "https://x/blue",
      },
    ],
    currency: "EUR",
    selectedVariantId: "red",
    canAddToCart: true,
  };
}

describe("productHeroVariantIntent", () => {
  it("resuelve la misma imagen principal que la galería y omite la ya visible", () => {
    const detail = product();
    expect(productHeroSourceUrlForVariant(detail, "blue")).toBe("https://x/blue");
    const getImageProps = vi.fn(() => ({
      props: {
        src: "https://opt/blue?w=3840&q=75",
        srcSet: "https://opt/blue?w=750&q=75 750w",
        sizes: "(max-width: 768px) 100vw, 50vw",
      },
    }));
    expect(
      productHeroWarmRequestForVariant({
        product: detail,
        variantId: "red",
        activeImageUrl: "https://x/red",
        sizes: "(max-width: 768px) 100vw, 50vw",
        getImageProps,
      }),
    ).toBeNull();
    expect(getImageProps).not.toHaveBeenCalled();

    const warmed = productHeroWarmRequestForVariant({
      product: detail,
      variantId: "blue",
      activeImageUrl: "https://x/red",
      sizes: "(max-width: 768px) 100vw, 50vw",
      getImageProps,
    });
    expect(warmed).toEqual({
      key: "https://x/blue",
      src: "https://opt/blue?w=3840&q=75",
      srcSet: "https://opt/blue?w=750&q=75 750w",
      sizes: "(max-width: 768px) 100vw, 50vw",
    });
    expect(getImageProps).toHaveBeenCalledWith({
      alt: "",
      src: "https://x/blue",
      fill: true,
      sizes: "(max-width: 768px) 100vw, 50vw",
    });
  });

  it("deduplica, limita a tres recursos y mantiene una sola descarga en curso", () => {
    const calls: string[] = [];
    const pending: Array<() => void> = [];
    const session = createProductHeroWarmSession((item, done) => {
      calls.push(item.key);
      pending.push(done);
    });
    const finish = () => {
      const done = pending.pop();
      if (done) done();
    };

    session.warm(request("a"));
    session.warm(request("a"));
    session.warm(request("b"));
    session.warm(request("c"));
    expect(calls).toEqual(["a"]);

    finish();
    expect(calls).toEqual(["a", "c"]);

    finish();
    session.warm(request("d"));
    expect(calls).toEqual(["a", "c", "d"]);
    finish();

    session.warm(request("e"));
    session.warm(request("a"));
    expect(calls).toEqual(["a", "c", "d"]);
    expect(session.startedCount()).toBe(PRODUCT_HERO_WARM_LIMIT);
  });
});
