"use client";

import type { CheckoutSubmitActionsProps } from "@shopenlinea/commerce-runtime-contract";

export function CheckoutSubmitActions({
  label = "Confirmar pedido",
  submitting,
  error,
  disabled,
  onSubmit,
}: CheckoutSubmitActionsProps) {
  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={disabled || submitting}
        onClick={() => void onSubmit()}
        className="w-full cursor-pointer bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {submitting ? "Procesando…" : label}
      </button>
    </div>
  );
}
