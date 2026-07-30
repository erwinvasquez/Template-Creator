import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  createEmptyCheckoutFormState,
  DEFAULT_PREVIEW_CAPABILITIES,
  type CheckoutViewModel,
} from "@shopenlinea/commerce-runtime-contract";
import { CheckoutPage } from "fashion-atelier-v1/client";

const checkoutVm: CheckoutViewModel = {
  requiresShipping: true,
  shippingSelectionPending: false,
  lines: [
    {
      lineId: "l1",
      productName: "Abrigo Cashmere Stone",
      variantLabel: "M / Stone",
      quantity: 1,
      lineDisplayPrice: "420,00 €",
      imageUrl: null,
    },
  ],
  totals: {
    subtotalDisplay: "420,00 €",
    shippingDisplay: "Gratis",
    discountDisplay: null,
    taxDisplay: null,
    totalDisplay: "420,00 €",
    currency: "EUR",
  },
  shippingMethods: [
    {
      id: "pickup",
      kind: "pickup",
      label: "Recogida en tienda",
      priceDisplay: "Gratis",
    },
  ],
  paymentMethods: [
    { id: "qr", kind: "qr", label: "QR (comprobante)" },
    { id: "cod", kind: "cashOnDelivery", label: "Contra entrega" },
  ],
  pickupBranches: [
    {
      id: "b1",
      name: "Atelier Centro",
      addressLabel: "Calle Mayor 12",
    },
  ],
  appliedPromotions: [],
  salesMode: "stock",
};

describe("CheckoutPage", () => {
  it("renders Atelier fields without slot-host copy", () => {
    const onStateChange = vi.fn();
    render(
      <CheckoutPage
        checkout={checkoutVm}
        state={createEmptyCheckoutFormState({
          shippingMethodId: "pickup",
          pickupBranchId: "b1",
          paymentMethodId: "qr",
        })}
        capabilities={DEFAULT_PREVIEW_CAPABILITIES}
        actions={{
          previewCheckout: vi.fn(async () => ({
            ok: true,
            checkout: checkoutVm,
          })),
          placeOrder: vi.fn(async () => ({ ok: true, orderId: "1" })),
          uploadPaymentVoucher: vi.fn(async () => ({ ok: true })),
        }}
        onStateChange={onStateChange}
      />,
    );

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/elige cómo pagar/i)).toBeInTheDocument();
    expect(screen.getByText(/tengo un código de descuento/i)).toBeInTheDocument();
    expect(screen.queryByText(/slot host/i)).not.toBeInTheDocument();
  });

  it("validates required customer fields on submit", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    render(
      <CheckoutPage
        checkout={checkoutVm}
        state={createEmptyCheckoutFormState({
          shippingMethodId: "pickup",
          pickupBranchId: "b1",
          paymentMethodId: "qr",
        })}
        capabilities={DEFAULT_PREVIEW_CAPABILITIES}
        actions={{
          previewCheckout: vi.fn(async () => ({
            ok: true,
            checkout: checkoutVm,
          })),
          placeOrder: vi.fn(async () => ({ ok: true, orderId: "1" })),
          uploadPaymentVoucher: vi.fn(async () => ({ ok: true })),
        }}
        onStateChange={onStateChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /confirmar pedido/i }));
    expect(onStateChange).toHaveBeenCalled();
    const last = onStateChange.mock.calls.at(-1)?.[0];
    expect(last?.fieldErrors?.fullName).toBeTruthy();
    expect(last?.fieldErrors?.email).toBeTruthy();
  });
});
