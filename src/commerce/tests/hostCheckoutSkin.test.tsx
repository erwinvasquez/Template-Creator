import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { hostCheckoutSkin as atelierSkin } from "fashion-atelier-v1/client";
import { hostCheckoutSkin as celestineSkin } from "fashion-celestine-v1/client";
import { hostCheckoutSkin as orionSkin } from "jewelry-orion-v1/client";
import { hostCheckoutSkin as voxaSkin } from "academy-voxa-v1/client";
import {
  HOST_CHECKOUT_SKIN_REQUIRED_KEYS,
} from "../../../scripts/lib/host-checkout-skin-contract.mjs";

const TEMPLATE_SKINS = [
  { id: "fashion-atelier-v1", skin: atelierSkin },
  { id: "fashion-celestine-v1", skin: celestineSkin },
  { id: "jewelry-orion-v1", skin: orionSkin },
  { id: "academy-voxa-v1", skin: voxaSkin },
] as const;

describe("hostCheckoutSkin", () => {
  for (const { id, skin } of TEMPLATE_SKINS) {
    describe(id, () => {
      it("exports every HostCheckoutSkin contract key", () => {
        for (const key of HOST_CHECKOUT_SKIN_REQUIRED_KEYS) {
          expect(skin[key], `${id} missing hostCheckoutSkin.${key}`).toBeTruthy();
        }
      });

      it("exports layout and primitive components", () => {
        expect(skin.Layout).toBeTypeOf("function");
        expect(skin.Field).toBeTypeOf("function");
        expect(skin.RadioOption).toBeTypeOf("function");
        expect(skin.PaymentCard).toBeTypeOf("function");
        expect(skin.SummaryLine).toBeTypeOf("function");
        expect(skin.LineItem).toBeTypeOf("function");
        expect(skin.CountrySelect).toBeTypeOf("function");
        expect(skin.CheckboxRow).toBeTypeOf("function");
        expect(skin.PhoneRow).toBeTypeOf("function");
        expect(skin.Notice).toBeTypeOf("function");
        expect(skin.ErrorText).toBeTypeOf("function");
        expect(skin.OrderSummary).toBeTypeOf("function");
        expect(skin.PrimaryButton).toBeTypeOf("function");
        expect(skin.SecondaryLink).toBeTypeOf("function");
      });
    });
  }

  it("Layout renders host-supplied section labels", () => {
    render(
      <atelierSkin.Layout
        labels={{
          pageTitle: "Checkout test",
          customerSection: "Cliente",
          shippingSection: "Envío",
          paymentSection: "Pago",
          summarySection: "Resumen",
        }}
        customerForm={<div>customer</div>}
        shippingSelector={<div>shipping</div>}
        paymentSelector={<div>payment</div>}
        orderSummary={<div>summary</div>}
        actions={<div>actions</div>}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Checkout test" })).toBeInTheDocument();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByText("Envío")).toBeInTheDocument();
    expect(screen.getByText("Pago")).toBeInTheDocument();
    expect(screen.getByText("Resumen")).toBeInTheDocument();
  });

  it("OrderSummary composes aside layout with host slots", () => {
    render(
      <atelierSkin.OrderSummary
        discountSection={<span>discount</span>}
        lineItemsSection={<li>line</li>}
        promotionsSection={<span>promo</span>}
        fulfillmentNotice="Entrega en 3 días"
        totalsSection={<span>totals</span>}
      />,
    );

    expect(screen.getByText("discount")).toBeInTheDocument();
    expect(screen.getByText("line")).toBeInTheDocument();
    expect(screen.getByText("promo")).toBeInTheDocument();
    expect(screen.getByText("Entrega en 3 días")).toBeInTheDocument();
    expect(screen.getByText("totals")).toBeInTheDocument();
  });

  it("LineItem renders compare-at price when provided", () => {
    render(
      <atelierSkin.LineItem
        title="Abrigo"
        quantity={1}
        priceDisplay="420,00 €"
        compareAtPriceDisplay="480,00 €"
        imageUrl="https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=96&q=80"
      />,
    );

    expect(screen.getByText("Abrigo")).toBeInTheDocument();
    expect(screen.getByText("480,00 €")).toHaveClass("line-through");
    expect(screen.getByText("420,00 €")).toBeInTheDocument();
  });
});
