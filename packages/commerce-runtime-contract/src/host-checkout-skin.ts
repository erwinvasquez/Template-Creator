import type { ComponentType, ReactNode } from "react";

import type { CheckoutLayoutProps } from "./template-views";

/** Section titles — always supplied by the SaaS host (i18n), never from template content. */
export interface HostCheckoutLayoutLabels {
  pageTitle: string;
  customerSection: string;
  shippingSection: string;
  paymentSection: string;
  summarySection: string;
}

export type HostCheckoutLayoutProps = CheckoutLayoutProps &
  Readonly<{
    labels: HostCheckoutLayoutLabels;
  }>;

export interface HostCheckoutFieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  error?: string | null;
}

export interface HostCheckoutRadioOptionProps {
  name: string;
  value: string;
  checked: boolean;
  label: string;
  description?: string | null;
  disabled?: boolean;
  onChange: () => void;
}

export interface HostCheckoutPaymentCardProps {
  name: string;
  value: string;
  checked: boolean;
  title: string;
  description?: string | null;
  disabled?: boolean;
  onChange: () => void;
}

export interface HostCheckoutSummaryLineProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface HostCheckoutLineItemProps {
  imageUrl?: string | null;
  title: string;
  variantLabel?: string | null;
  quantity: number;
  priceDisplay: string;
  compareAtPriceDisplay?: string | null;
  imagePlaceholder?: string;
}

export interface HostCheckoutCountrySelectProps {
  value: string;
  onChange: (iso: string) => void;
  options: ReadonlyArray<{ value: string; label: string; title?: string }>;
  disabled?: boolean;
  "aria-label": string;
}

export interface HostCheckoutCheckboxRowProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
}

export interface HostCheckoutPhoneRowProps {
  children: ReactNode;
}

export interface HostCheckoutOrderSummaryProps {
  /** Cupón: checkbox + campo (host monta con CheckboxRow/Field; template solo envuelve). */
  discountSection: ReactNode;
  /** Líneas del carrito (hijos dentro del `<ul>` del template). */
  lineItemsSection: ReactNode;
  /** Promos aplicadas; null si no hay. */
  promotionsSection?: ReactNode | null;
  /** Texto en Notice (string ya formateado por el host). */
  fulfillmentNotice?: string | null;
  /** Bloque subtotal/descuento/envío/total (host monta SummaryLines). */
  totalsSection: ReactNode;
  /** Errores preview / “recalculando…”; null si no hay. */
  statusSection?: ReactNode | null;
}

/**
 * Visual skin for host-owned checkout (`CheckoutPageContent`).
 * Templates export this; they must NOT implement checkout logic or copy.
 */
export interface HostCheckoutSkin {
  inputClassName: string;
  selectClassName: string;
  /** Legacy / group labels (shipping method group, etc.). */
  labelClassName: string;
  /** Per-field labels (name, email, discount code input). */
  fieldLabelClassName: string;
  mutedTextClassName: string;
  sectionGapClassName?: string;
  /** Layout for country + phone row; use with {@link PhoneRow}. */
  phoneRowClassName?: string;
  Layout: ComponentType<HostCheckoutLayoutProps>;
  Field: ComponentType<HostCheckoutFieldProps>;
  RadioOption: ComponentType<HostCheckoutRadioOptionProps>;
  PaymentCard: ComponentType<HostCheckoutPaymentCardProps>;
  SummaryLine: ComponentType<HostCheckoutSummaryLineProps>;
  LineItem: ComponentType<HostCheckoutLineItemProps>;
  CountrySelect: ComponentType<HostCheckoutCountrySelectProps>;
  CheckboxRow: ComponentType<HostCheckoutCheckboxRowProps>;
  PhoneRow: ComponentType<HostCheckoutPhoneRowProps>;
  Notice: ComponentType<{ children: ReactNode }>;
  ErrorText: ComponentType<{ children: ReactNode }>;
  /** Composición del aside resumen (layout template; datos/host i18n). */
  OrderSummary: ComponentType<HostCheckoutOrderSummaryProps>;
  PrimaryButton: ComponentType<{
    type?: "submit" | "button";
    disabled?: boolean;
    className?: string;
    children: ReactNode;
  }>;
  SecondaryLink: ComponentType<{
    href: string;
    children: ReactNode;
  }>;
}
