import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ProductCardViewModel } from "@shopenlinea/commerce-runtime-contract";
import { CommerceProductCard } from "fashion-atelier-v1/client";
import defaults from "../../../templates/fashion-atelier-v1/defaults.json";
import { SiteContentProvider } from "../../../templates/fashion-atelier-v1/src/lib/site-content";

function card(partial: Partial<ProductCardViewModel> = {}): ProductCardViewModel {
  return {
    id: "p1",
    slug: "abrigo",
    href: "/tienda/abrigo",
    name: "Abrigo",
    imageUrl: "https://example.com/a.jpg",
    displayPrice: "420,00 €",
    currency: "EUR",
    ...partial,
  };
}

describe("CommerceProductCard — PLP stock→MTO (R6)", () => {
  it("made_to_order_available muestra buyMadeToOrderCta y href MTO", () => {
    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <CommerceProductCard
          product={card({
            stockLabel: "out_of_stock",
            madeToOrderUpsell: {
              productHref: "/tienda/abrigo?salesMode=madeToOrder",
            },
          })}
        />
      </SiteContentProvider>,
    );

    const cta = defaults.ui.product.buyMadeToOrderCta as string;
    expect(screen.getByText(cta)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/t/atelier/tienda/abrigo?salesMode=madeToOrder",
    );
    expect(screen.queryByText(defaults.ui.product.outOfStock as string)).toBeNull();
  });

  it("sold_out muestra Agotado", () => {
    render(
      <SiteContentProvider payload={defaults as never} basePath="/t/atelier">
        <CommerceProductCard product={card({ stockLabel: "out_of_stock" })} />
      </SiteContentProvider>,
    );

    expect(
      screen.getByText(defaults.ui.product.outOfStock as string),
    ).toBeInTheDocument();
  });
});
