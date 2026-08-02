"use client";

import type { CheckoutPaymentSelectorProps } from "@shopenlinea/commerce-runtime-contract";

export function CheckoutPaymentSelector({
  checkout,
  paymentMethodId,
  capabilities,
  errors,
  onSelectPayment,
  onUploadVoucher,
  disabled,
}: CheckoutPaymentSelectorProps) {
  const selected = checkout.paymentMethods.find(
    (m) => m.id === paymentMethodId,
  );
  const allowVoucher =
    capabilities.paymentVoucherUpload !== "unsupported" &&
    Boolean(selected?.requiresVoucher);

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-secondary">
        Elige cómo pagar
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {checkout.paymentMethods.map((method) => {
          const active = method.id === paymentMethodId;
          return (
            <button
              key={method.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPayment(method.id)}
              className={`cursor-pointer border px-4 py-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? "border-primary bg-surface"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <span className="block text-sm font-medium text-primary">
                {method.label}
              </span>
              {method.instructions ? (
                <span className="mt-1 block text-xs leading-relaxed text-muted">
                  {method.instructions}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {errors?.paymentMethodId ? (
        <p className="text-xs text-red-700">{errors.paymentMethodId}</p>
      ) : null}

      {selected?.bankDetails ? (
        <p className="border border-border bg-surface px-4 py-3 text-xs text-muted whitespace-pre-line">
          {selected.bankDetails}
        </p>
      ) : null}

      {allowVoucher && onUploadVoucher && selected ? (
        <div>
          <label
            className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-secondary"
            htmlFor="checkout-voucher"
          >
            Comprobante de pago
          </label>
          <input
            id="checkout-voucher"
            type="file"
            accept="image/*,.pdf"
            disabled={disabled}
            className="block w-full text-sm text-muted file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-2 file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.14em] file:text-background"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUploadVoucher(selected.id, file);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
