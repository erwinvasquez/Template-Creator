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
  commerceLineItemBodyClassName,
  commerceLineItemCompareAtClassName,
  commerceLineItemFinalPriceClassName,
  commerceLineItemHeaderRowClassName,
  commerceLineItemImageBorderClassName,
  commerceLineItemImageShellClassName,
  commerceLineItemListClassName,
  commerceLineItemPriceColumnClassName,
  commerceLineItemQuantityClassName,
  commerceLineItemRowClassName,
  commerceLineItemTitleClassName,
  commerceLineItemVariantClassName,
  hostCheckoutChoiceLabelTextClassName,
  hostCheckoutContainWidthClassName,
  hostCheckoutInputClassName,
} from "@shopenlinea/commerce-runtime-contract";
import { KitIncludesList, kitCommercialCopy } from "../components/commerce/KitCommercialBlocks";
import { useSiteContent } from "../lib/site-content";

export const checkoutInputClassName = hostCheckoutInputClassName;

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
          <span className="mt-1 block break-words whitespace-pre-line text-xs text-muted">
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
  kitIncludes,
}: HostCheckoutLineItemProps) {
  const { payload } = useSiteContent();
  const kitCopy = kitCommercialCopy(payload.brand.locale);
  return (
    <li className={commerceLineItemRowClassName}>
      <div
        className={`${commerceLineItemImageShellClassName} ${commerceLineItemImageBorderClassName}`}
      >
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="72px" />
        ) : null}
      </div>
      <div className={commerceLineItemBodyClassName}>
        <div className={commerceLineItemHeaderRowClassName}>
          <div className="min-w-0 flex-1">
            <p className={commerceLineItemTitleClassName} title={title}>{title}</p>
            {variantLabel ? (
              <p className={commerceLineItemVariantClassName} title={variantLabel}>
                {variantLabel}
              </p>
            ) : null}
            <p className={commerceLineItemQuantityClassName}>× {quantity}</p>
            <KitIncludesList includes={kitIncludes} title={kitCopy.includes} />
          </div>
          <div className={commerceLineItemPriceColumnClassName}>
            {compareAtPriceDisplay ? (
              <p className={commerceLineItemCompareAtClassName}>{compareAtPriceDisplay}</p>
            ) : null}
            <p className={commerceLineItemFinalPriceClassName}>{priceDisplay}</p>
          </div>
        </div>
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
      <span className={`min-w-0 flex-1 text-base text-primary ${hostCheckoutChoiceLabelTextClassName}`}>
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
  deliveryPolicySection,
  deliveryGroupsSection,
  preparationSection,
  quoteExpired,
  paymentConsentRequired,
}: HostCheckoutOrderSummaryProps) {
  return (
    <div className="space-y-4 min-w-0 text-sm">
      {statusSection ? <div className="min-w-0">{statusSection}</div> : null}
      <div className="space-y-3 min-w-0">{discountSection}</div>
      <ul className={`min-w-0 ${commerceLineItemListClassName}`}>
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
      {deliveryPolicySection ? <div className="min-w-0">{deliveryPolicySection}</div> : null}
      {deliveryGroupsSection ? <div className="min-w-0 space-y-2">{deliveryGroupsSection}</div> : null}
      {preparationSection ? <div className="min-w-0">{preparationSection}</div> : null}
      {quoteExpired ? <CheckoutNotice>{quoteExpired}</CheckoutNotice> : null}
      {paymentConsentRequired ? <CheckoutNotice>{paymentConsentRequired}</CheckoutNotice> : null}
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
