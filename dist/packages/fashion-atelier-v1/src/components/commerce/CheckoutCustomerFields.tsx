"use client";

import type { CheckoutCustomerFieldsProps } from "@shopenlinea/commerce-runtime-contract";

/** ISO country code → dial. Select value stays ISO; UI shows flag emoji + dial. */
export const PHONE_COUNTRIES = [
  { code: "ES", dial: "+34", name: "España", flag: "🇪🇸" },
  { code: "BO", dial: "+591", name: "Bolivia", flag: "🇧🇴" },
  { code: "MX", dial: "+52", name: "México", flag: "🇲🇽" },
  { code: "US", dial: "+1", name: "EE.UU.", flag: "🇺🇸" },
] as const;

export function dialForCountryCode(code: string): string {
  return PHONE_COUNTRIES.find((c) => c.code === code)?.dial ?? "";
}

const fieldClass =
  "w-full border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition-colors focus:border-primary disabled:opacity-50";

const labelClass =
  "mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-secondary";

export function CheckoutCustomerFields({
  value,
  errors,
  onChange,
  disabled,
}: CheckoutCustomerFieldsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass} htmlFor="checkout-fullName">
          Nombre completo
        </label>
        <input
          id="checkout-fullName"
          type="text"
          autoComplete="name"
          disabled={disabled}
          value={value.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          className={fieldClass}
        />
        {errors?.fullName ? (
          <p className="mt-1.5 text-xs text-red-700">{errors.fullName}</p>
        ) : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="checkout-email">
          Correo electrónico
        </label>
        <input
          id="checkout-email"
          type="email"
          autoComplete="email"
          disabled={disabled}
          value={value.email}
          onChange={(e) => onChange({ email: e.target.value })}
          className={fieldClass}
        />
        {errors?.email ? (
          <p className="mt-1.5 text-xs text-red-700">{errors.email}</p>
        ) : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="checkout-phone">
          Teléfono
        </label>
        <div className="flex gap-2">
          <select
            aria-label="Código de país del teléfono"
            disabled={disabled}
            value={value.phoneCountryCode}
            onChange={(e) => onChange({ phoneCountryCode: e.target.value })}
            className={`${fieldClass} max-w-[9rem] shrink-0`}
          >
            {PHONE_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} title={c.name}>
                {c.flag} {c.dial}
              </option>
            ))}
          </select>
          <input
            id="checkout-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            disabled={disabled}
            value={value.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="Número"
            className={fieldClass}
          />
        </div>
        {errors?.phone ? (
          <p className="mt-1.5 text-xs text-red-700">{errors.phone}</p>
        ) : null}
      </div>
    </div>
  );
}
