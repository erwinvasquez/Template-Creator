"use client";

import type { CheckoutShippingSelectorProps } from "@shopenlinea/commerce-runtime-contract";

export function CheckoutShippingSelector({
  checkout,
  shippingMethodId,
  pickupBranchId,
  capabilities,
  errors,
  onSelectShipping,
  onSelectPickupBranch,
  disabled,
}: CheckoutShippingSelectorProps) {
  const selected = checkout.shippingMethods.find(
    (m) => m.id === shippingMethodId,
  );
  const isPickup = selected?.kind === "pickup";
  const showMap =
    capabilities.checkoutMapPicker !== "unsupported" &&
    selected?.kind === "localMap";

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-secondary">
          Método de envío
        </p>
        <ul className="space-y-2">
          {checkout.shippingMethods.map((method) => {
            const active = method.id === shippingMethodId;
            return (
              <li key={method.id}>
                <label
                  className={`flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors ${
                    active
                      ? "border-primary bg-surface"
                      : "border-border hover:border-primary/40"
                  } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    name="checkout-shipping"
                    className="mt-1 cursor-pointer accent-primary"
                    disabled={disabled}
                    checked={active}
                    onChange={() => onSelectShipping(method.id)}
                  />
                  <span className="flex-1 text-sm">
                    <span className="font-medium text-primary">
                      {method.label}
                    </span>
                    {method.priceDisplay ? (
                      <span className="text-muted"> · {method.priceDisplay}</span>
                    ) : null}
                    {method.estimatedDaysLabel ? (
                      <span className="mt-0.5 block text-xs text-muted">
                        {method.estimatedDaysLabel}
                      </span>
                    ) : null}
                    {method.description ? (
                      <span className="mt-0.5 block text-xs text-muted">
                        {method.description}
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {errors?.shippingMethodId ? (
          <p className="mt-2 text-xs text-red-700">{errors.shippingMethodId}</p>
        ) : null}
      </div>

      {isPickup && checkout.pickupBranches.length > 0 ? (
        <div>
          <label
            className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-secondary"
            htmlFor="checkout-pickup-branch"
          >
            Tienda para retiro
          </label>
          <select
            id="checkout-pickup-branch"
            disabled={disabled}
            value={pickupBranchId ?? ""}
            onChange={(e) => onSelectPickupBranch(e.target.value)}
            className="w-full border border-border bg-background px-4 py-3 text-sm text-primary outline-none focus:border-primary disabled:opacity-50"
          >
            <option value="" disabled>
              Selecciona una sede
            </option>
            {checkout.pickupBranches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.addressLabel ? ` — ${b.addressLabel}` : ""}
              </option>
            ))}
          </select>
          {errors?.pickupBranchId ? (
            <p className="mt-2 text-xs text-red-700">{errors.pickupBranchId}</p>
          ) : null}
        </div>
      ) : null}

      {showMap ? (
        <p className="border border-dashed border-border bg-surface px-4 py-6 text-center text-xs text-muted">
          Mapa de entrega (host / capability checkoutMapPicker)
        </p>
      ) : null}
    </div>
  );
}
