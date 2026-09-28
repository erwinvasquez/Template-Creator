import { describe, expect, it } from "vitest";
import type { ProductCardViewModel } from "@shopenlinea/commerce-runtime-contract";
import {
  catalogCardHref,
  resolveCatalogAvailabilityPresentation,
} from "@shopenlinea/commerce-runtime-contract";

function card(
  partial: Partial<ProductCardViewModel> = {},
): ProductCardViewModel {
  return {
    id: "p1",
    slug: "abrigo",
    href: "/tienda/abrigo",
    name: "Abrigo",
    imageUrl: "https://example.com/a.jpg",
    displayPrice: "100 €",
    currency: "EUR",
    ...partial,
  };
}

const upsell = {
  productHref: "/tienda/abrigo?salesMode=madeToOrder",
  preparationPromiseLabel: "3–5 días",
};

describe("resolveCatalogAvailabilityPresentation", () => {
  it("out_of_stock + upsell → made_to_order_available", () => {
    expect(
      resolveCatalogAvailabilityPresentation(
        card({ stockLabel: "out_of_stock", madeToOrderUpsell: upsell }),
      ),
    ).toBe("made_to_order_available");
  });

  it("out_of_stock sin upsell → sold_out", () => {
    expect(
      resolveCatalogAvailabilityPresentation(card({ stockLabel: "out_of_stock" })),
    ).toBe("sold_out");
  });

  it("contact → contact", () => {
    expect(
      resolveCatalogAvailabilityPresentation(card({ stockLabel: "contact" })),
    ).toBe("contact");
  });

  it("available → available", () => {
    expect(
      resolveCatalogAvailabilityPresentation(card({ stockLabel: "available" })),
    ).toBe("available");
  });
});

describe("catalogCardHref", () => {
  it("made_to_order_available → productHref MTO", () => {
    expect(
      catalogCardHref(
        card({ stockLabel: "out_of_stock", madeToOrderUpsell: upsell }),
      ),
    ).toBe(upsell.productHref);
  });

  it("sold_out → href stock", () => {
    expect(
      catalogCardHref(card({ href: "/tienda/abrigo", stockLabel: "out_of_stock" })),
    ).toBe("/tienda/abrigo");
  });
});
