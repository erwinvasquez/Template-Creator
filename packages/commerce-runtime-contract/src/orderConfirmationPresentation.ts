import type { CheckoutTotalsViewModel } from "./checkout";

export type OrderConfirmationSummaryLabels = Readonly<{
  subtotalOriginal: string;
  subtotal: string;
  quantityDiscounts: string;
  promotions: string;
  shipping: string;
  shippingPending: string;
  tax: string;
  total: string;
  kitIncludes?: string;
}>;

export type OrderConfirmationSummaryRow = Readonly<{
  key: string;
  label: string;
  value: string;
  muted?: boolean;
  emphasize?: boolean;
  successAccent?: boolean;
}>;

export function buildOrderConfirmationSummaryRows(
  totals: CheckoutTotalsViewModel,
  labels: OrderConfirmationSummaryLabels,
): OrderConfirmationSummaryRow[] {
  const rows: OrderConfirmationSummaryRow[] = [];
  const hasDiscountBreakdown =
    totals.quantityDiscountDisplay != null || totals.discountDisplay != null;

  if (hasDiscountBreakdown) {
    rows.push({
      key: "subtotal-original",
      label: labels.subtotalOriginal,
      value: totals.subtotalDisplay,
      muted: true,
    });
  } else {
    rows.push({
      key: "subtotal",
      label: labels.subtotal,
      value: totals.subtotalDisplay,
      muted: true,
    });
  }

  if (totals.quantityDiscountDisplay) {
    rows.push({
      key: "quantity-discount",
      label: labels.quantityDiscounts,
      value: `−${totals.quantityDiscountDisplay}`,
    });
  }

  if (totals.discountDisplay) {
    rows.push({
      key: "promotion-discount",
      label: labels.promotions,
      value: `−${totals.discountDisplay}`,
      successAccent: true,
    });
  }

  if (totals.shippingDisplay) {
    rows.push({
      key: "shipping",
      label: labels.shipping,
      value: totals.shippingDisplay,
      muted: true,
    });
  } else if (totals.shippingPendingLabel) {
    rows.push({
      key: "shipping-pending",
      label: labels.shipping,
      value: totals.shippingPendingLabel,
      muted: true,
    });
  }

  if (totals.taxDisplay) {
    rows.push({
      key: "tax",
      label: labels.tax,
      value: totals.taxDisplay,
      muted: true,
    });
  }

  rows.push({
    key: "total",
    label: labels.total,
    value: totals.totalDisplay,
    emphasize: true,
  });

  return rows;
}
