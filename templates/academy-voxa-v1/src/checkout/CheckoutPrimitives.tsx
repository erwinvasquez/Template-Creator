"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import type {
  HostCheckoutCheckboxRowProps,
  HostCheckoutCountrySelectProps,
  HostCheckoutFieldProps,
  HostCheckoutLineItemProps,
  HostCheckoutOrderSummaryProps,
  HostCheckoutPaymentCardProps,
  HostCheckoutPhoneRowProps,
  HostCheckoutRadioOptionProps,
  HostCheckoutSummaryLineProps,
} from "@shopenlinea/commerce-runtime-contract";
import {
  hostCheckoutChoiceLabelTextClassName,
  hostCheckoutContainWidthClassName,
  hostCheckoutLineItemPricingClassName,
  hostCheckoutLineItemRowClassName,
  hostCheckoutLineItemTitleClampClassName,
  hostCheckoutLineItemVariantClampClassName,
} from "@shopenlinea/commerce-runtime-contract";

export const checkoutInputClassName =
  `w-full ${hostCheckoutContainWidthClassName} border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition-colors duration-200 focus:border-primary disabled:opacity-50`;

export const checkoutFieldLabelClassName =
  "mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-secondary";

export const checkoutMutedTextClassName = "text-sm text-muted";

export const checkoutSectionGapClassName = "space-y-5";

export const checkoutPhoneRowClassName =
  `mt-2 grid ${hostCheckoutContainWidthClassName} grid-cols-1 gap-3 sm:grid-cols-[6.75rem_minmax(0,1fr)] sm:gap-4`;

const countrySelectClassName = `${checkoutInputClassName} shrink-0 w-full max-w-[38%] sm:max-w-none sm:w-[6.75rem]`;

export function CheckoutField({ label, htmlFor, children, error }: HostCheckoutFieldProps) {
  return (
    <div className={hostCheckoutContainWidthClassName}>
      <label className={checkoutFieldLabelClassName} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <CheckoutErrorText>{error}</CheckoutErrorText> : null}
    </div>
  );
}

export function CheckoutRadioOption({
  name,
  value,
  checked,
  label,
  description,
  disabled,
  onChange,
}: HostCheckoutRadioOptionProps) {
  return (
    <label
      className={`flex ${hostCheckoutContainWidthClassName} cursor-pointer items-start gap-3 border border-border p-4 transition-opacity ${
        disabled ? "cursor-not-allowed opacity-50" : checked ? "" : "opacity-70 hover:opacity-100"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange()}
        className="mt-1 shrink-0 accent-primary"
      />
      <span className="min-w-0 flex-1">
        <span
          className={`text-sm font-medium text-primary ${hostCheckoutChoiceLabelTextClassName}`}
        >
          {label}
        </span>
        {description ? (
          <span
            className={`mt-1 block text-xs text-muted ${hostCheckoutChoiceLabelTextClassName}`}
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function CheckoutPaymentCard({
  name,
  value,
  checked,
  title,
  description,
  disabled,
  onChange,
}: HostCheckoutPaymentCardProps) {
  return (
    <label
      className={`flex ${hostCheckoutContainWidthClassName} cursor-pointer items-start gap-3 border border-border p-4 transition-opacity ${
        disabled ? "cursor-not-allowed opacity-50" : checked ? "" : "opacity-70 hover:opacity-100"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange()}
        className="mt-1 shrink-0 accent-primary"
      />
      <span className="min-w-0 flex-1">
        <span
          className={`text-sm font-medium text-primary ${hostCheckoutChoiceLabelTextClassName}`}
        >
          {title}
        </span>
        {description ? (
          <span
            className={`mt-1 block text-xs text-muted ${hostCheckoutChoiceLabelTextClassName}`}
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function CheckoutSummaryLine({ label, value, emphasis }: HostCheckoutSummaryLineProps) {
  return (
    <div
      className={`flex min-w-0 justify-between gap-4 ${
        emphasis
          ? "border-t border-border pt-2 font-semibold text-primary"
          : "text-muted"
      }`}
    >
      <span className="min-w-0 break-words">{label}</span>
      <span className="shrink-0 tabular-nums text-primary">{value}</span>
    </div>
  );
}

export function CheckoutLineItem({
  imageUrl,
  title,
  variantLabel,
  quantity,
  priceDisplay,
  compareAtPriceDisplay,
}: HostCheckoutLineItemProps) {
  return (
    <li className={hostCheckoutLineItemRowClassName}>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-border bg-background">
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="48px" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`${hostCheckoutLineItemTitleClampClassName} font-medium text-primary`}
          title={title}
        >
          {title}
        </p>
        {variantLabel ? (
          <p
            className={`${hostCheckoutLineItemVariantClampClassName} text-xs text-muted`}
            title={variantLabel}
          >
            {variantLabel}
          </p>
        ) : null}
        <p className={hostCheckoutLineItemPricingClassName}>
          <span className="tabular-nums">×{quantity}</span>
          <span className="mx-1" aria-hidden="true">—</span>
          <span className="inline-flex min-w-0 max-w-full flex-wrap items-baseline gap-x-1">
            {compareAtPriceDisplay ? (
              <span className="text-muted line-through tabular-nums">{compareAtPriceDisplay}</span>
            ) : null}
            <span className="font-medium text-primary tabular-nums">{priceDisplay}</span>
          </span>
        </p>
      </div>
    </li>
  );
}

export function CheckoutCountrySelect({
  value,
  onChange,
  options,
  disabled,
  "aria-label": ariaLabel,
}: HostCheckoutCountrySelectProps) {
  return (
    <select
      className={countrySelectClassName}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} title={opt.title}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function CheckoutCheckboxRow({
  checked,
  onCheckedChange,
  disabled,
  children,
}: HostCheckoutCheckboxRowProps) {
  return (
    <label
      className={`flex ${hostCheckoutContainWidthClassName} cursor-pointer items-start gap-2`}
    >
      <input
        type="checkbox"
        className="mt-0.5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <span className={`min-w-0 flex-1 text-sm text-primary ${hostCheckoutChoiceLabelTextClassName}`}>
        {children}
      </span>
    </label>
  );
}

export function CheckoutPhoneRow({ children }: HostCheckoutPhoneRowProps) {
  return <div className={checkoutPhoneRowClassName}>{children}</div>;
}

export function CheckoutNotice({ children }: { children: ReactNode }) {
  return (
    <div className="border border-border bg-background px-3 py-2 text-xs text-muted">
      {children}
    </div>
  );
}

export function CheckoutErrorText({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-red-700">{children}</p>;
}

/**
 * Aside order summary layout — fixed block order:
 * statusSection → discount → line items → promotions → fulfillment → totals.
 */
export function CheckoutOrderSummary({
  discountSection,
  lineItemsSection,
  promotionsSection,
  fulfillmentNotice,
  totalsSection,
  statusSection,
}: HostCheckoutOrderSummaryProps) {
  return (
    <div className="space-y-4 min-w-0 text-sm">
      {statusSection ? <div className="min-w-0">{statusSection}</div> : null}
      <div className="space-y-3 min-w-0">{discountSection}</div>
      <ul className="max-h-64 min-w-0 space-y-3 overflow-y-auto list-none pl-0">
        {lineItemsSection}
      </ul>
      {promotionsSection ? (
        <div className="space-y-2 border-t border-border pt-4 min-w-0">
          {promotionsSection}
        </div>
      ) : null}
      {fulfillmentNotice ? (
        <CheckoutNotice>{fulfillmentNotice}</CheckoutNotice>
      ) : null}
      <div className="min-w-0 max-w-full space-y-2 border-t border-border pt-4">
        {totalsSection}
      </div>
    </div>
  );
}

export function CheckoutPrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full cursor-pointer border border-primary bg-primary px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-colors duration-200 hover:bg-transparent hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function CheckoutSecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="mt-6 inline-block border border-primary px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors duration-200 hover:bg-primary hover:text-background"
    >
      {children}
    </a>
  );
}
