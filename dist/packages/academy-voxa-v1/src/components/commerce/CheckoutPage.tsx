"use client";

import type { CheckoutPageProps } from "@shopenlinea/commerce-runtime-contract";
import {
  CheckoutCustomerFields,
  dialForCountryCode,
} from "./CheckoutCustomerFields";
import { CheckoutShippingSelector } from "./CheckoutShippingSelector";
import { CheckoutPaymentSelector } from "./CheckoutPaymentSelector";
import { CheckoutDiscountCode } from "./CheckoutDiscountCode";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { CheckoutSubmitActions } from "./CheckoutSubmitActions";

/**
 * Full Voxa checkout UI. Host passes CheckoutViewModel + form state + actions only.
 */
export function CheckoutPage({
  checkout,
  state,
  capabilities,
  actions,
  onStateChange,
  notices,
}: CheckoutPageProps) {
  const disabled = Boolean(state.submitting);

  async function refreshPreview(patch?: {
    shippingMethodId?: string | null;
    pickupBranchId?: string | null;
    paymentMethodId?: string | null;
  }) {
    await actions.previewCheckout({
      shippingMethodId:
        patch?.shippingMethodId !== undefined
          ? patch.shippingMethodId
          : state.shippingMethodId,
      pickupBranchId:
        patch?.pickupBranchId !== undefined
          ? patch.pickupBranchId
          : state.pickupBranchId,
      paymentMethodId:
        patch?.paymentMethodId !== undefined
          ? patch.paymentMethodId
          : state.paymentMethodId,
      customerEmail: state.customer.email || null,
    });
  }

  async function handleSubmit() {
    const fieldErrors: NonNullable<typeof state.fieldErrors> = {};
    if (!state.customer.fullName.trim()) {
      fieldErrors.fullName = "Indica tu nombre";
    }
    if (!state.customer.email.trim()) {
      fieldErrors.email = "Indica tu correo";
    }
    if (!state.shippingMethodId) {
      fieldErrors.shippingMethodId = "Elige un método de envío";
    }
    const method = checkout.shippingMethods.find(
      (m) => m.id === state.shippingMethodId,
    );
    if (
      method?.kind === "pickup" &&
      checkout.pickupBranches.length > 0 &&
      !state.pickupBranchId
    ) {
      fieldErrors.pickupBranchId = "Elige una sede";
    }
    if (!state.paymentMethodId) {
      fieldErrors.paymentMethodId = "Elige un método de pago";
    }
    if (Object.keys(fieldErrors).length) {
      onStateChange({ fieldErrors, submitError: null });
      return;
    }

    onStateChange({ submitting: true, submitError: null, fieldErrors: {} });
    const dial = dialForCountryCode(state.customer.phoneCountryCode);
    const national = state.customer.phone.trim().replace(/^\+/, "");
    const phoneE164 =
      national.length > 0
        ? `${dial}${national.replace(/^0+/, "").replace(/\s+/g, "")}`
        : null;
    const result = await actions.placeOrder(
      {
        shippingMethodId: state.shippingMethodId,
        pickupBranchId: state.pickupBranchId,
        paymentMethodId: state.paymentMethodId!,
        customer: {
          fullName: state.customer.fullName.trim(),
          email: state.customer.email.trim(),
          phone: phoneE164,
        },
      },
      `voxa-${Date.now()}`,
    );
    if (!result.ok) {
      onStateChange({
        submitting: false,
        submitError: result.errorMessage ?? "No se pudo confirmar el pedido",
      });
      return;
    }
    onStateChange({ submitting: false, submitError: null });
    if (result.redirectUrl && typeof window !== "undefined") {
      window.location.href = result.redirectUrl;
    } else if (result.confirmationHref && typeof window !== "undefined") {
      window.location.href = result.confirmationHref;
    }
  }

  return (
    <div className="pb-24 pt-12 md:pt-16">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <h1 className="font-serif text-4xl tracking-wide md:text-5xl">
          Checkout
        </h1>
        {notices ? (
          <p className="mt-6 text-sm text-muted">{notices}</p>
        ) : null}

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-10">
            <section className="space-y-4">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
                Cliente
              </h2>
              <CheckoutCustomerFields
                value={state.customer}
                errors={state.fieldErrors}
                disabled={disabled}
                onChange={(customerPatch) =>
                  onStateChange({
                    customer: customerPatch,
                    fieldErrors: {
                      ...state.fieldErrors,
                      fullName: undefined,
                      email: undefined,
                      phone: undefined,
                    },
                  })
                }
              />
            </section>

            {checkout.shippingMethods.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
                  Envío
                </h2>
                <CheckoutShippingSelector
                  checkout={checkout}
                  shippingMethodId={state.shippingMethodId}
                  pickupBranchId={state.pickupBranchId}
                  capabilities={capabilities}
                  errors={state.fieldErrors}
                  disabled={disabled}
                  onSelectShipping={(id) => {
                    onStateChange({
                      shippingMethodId: id,
                      fieldErrors: {
                        ...state.fieldErrors,
                        shippingMethodId: undefined,
                      },
                    });
                    void refreshPreview({ shippingMethodId: id });
                  }}
                  onSelectPickupBranch={(id) => {
                    onStateChange({
                      pickupBranchId: id,
                      fieldErrors: {
                        ...state.fieldErrors,
                        pickupBranchId: undefined,
                      },
                    });
                    void refreshPreview({ pickupBranchId: id });
                  }}
                />
              </section>
            ) : null}

            <section className="space-y-4">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
                Pago
              </h2>
              <CheckoutPaymentSelector
                checkout={checkout}
                paymentMethodId={state.paymentMethodId}
                capabilities={capabilities}
                errors={state.fieldErrors}
                disabled={disabled}
                onSelectPayment={(id) => {
                  onStateChange({
                    paymentMethodId: id,
                    fieldErrors: {
                      ...state.fieldErrors,
                      paymentMethodId: undefined,
                    },
                  });
                  void refreshPreview({ paymentMethodId: id });
                }}
                onUploadVoucher={async (paymentId, file) => {
                  await actions.uploadPaymentVoucher(paymentId, file);
                }}
              />
            </section>

            <CheckoutSubmitActions
              submitting={state.submitting}
              error={state.submitError}
              disabled={disabled}
              onSubmit={handleSubmit}
            />
          </div>

          <aside className="border border-border bg-surface p-6 md:p-8">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
              Resumen
            </h2>
            <div className="mt-6 space-y-5">
              <CheckoutDiscountCode
                enabled={state.discountCodeEnabled}
                code={state.discountCode}
                error={state.fieldErrors?.discountCode}
                disabled={disabled}
                onToggle={(enabled) =>
                  onStateChange({ discountCodeEnabled: enabled })
                }
                onCodeChange={(code) => onStateChange({ discountCode: code })}
                onApply={async () => {
                  await refreshPreview();
                }}
              />
              <CheckoutOrderSummary checkout={checkout} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
