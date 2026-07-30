"use client";

import type { CheckoutDiscountCodeProps } from "@shopenlinea/commerce-runtime-contract";

export function CheckoutDiscountCode({
  enabled,
  code,
  error,
  onToggle,
  onCodeChange,
  onApply,
  disabled,
}: CheckoutDiscountCodeProps) {
  return (
    <div className="space-y-3 border-b border-border pb-5">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
        <input
          type="checkbox"
          className="cursor-pointer accent-primary"
          checked={enabled}
          disabled={disabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        Tengo un código de descuento
      </label>
      {enabled ? (
        <div className="flex gap-2">
          <input
            type="text"
            disabled={disabled}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="Código"
            className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
          />
          {onApply ? (
            <button
              type="button"
              disabled={disabled || !code.trim()}
              onClick={() => void onApply()}
              className="cursor-pointer border border-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-background disabled:opacity-40"
            >
              Aplicar
            </button>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
