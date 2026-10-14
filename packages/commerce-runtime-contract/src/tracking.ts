/**
 * Serializable view models for public order tracking (T3-view).
 * Host RSC translates labels before passing to template components.
 */

export type OrderTrackingMilestoneState = "done" | "current" | "pending" | "error";

export interface OrderTrackingMilestoneViewModel {
  id: string;
  label: string;
  state: OrderTrackingMilestoneState;
  subLabel?: string | null;
  occurredAtDisplay?: string | null;
}

export interface OrderTrackingLineViewModel {
  lineId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitDisplayPrice: string;
  lineDisplayPrice: string;
  compareAtDisplay?: string | null;
  imageUrl?: string | null;
  /** Composición congelada. No son líneas de precio. */
  kitIncludes?: ReadonlyArray<{ label: string; quantity: number }> | null;
}

export interface OrderTrackingShippingViewModel {
  methodName: string | null;
  pickupBranchName: string | null;
  branchAddress: string | null;
  addressLine1: string | null;
  locality: string | null;
  adminAreaLevel1Name: string | null;
  reference: string | null;
  carrierName: string | null;
  trackingNumber: string | null;
  isPickup: boolean;
  fulfillmentPromiseText?: string | null;
}

export interface OrderTrackingTotalsViewModel {
  subtotalDisplay: string;
  quantityDiscountDisplay?: string | null;
  discountDisplay?: string | null;
  shippingDisplay?: string | null;
  taxDisplay?: string | null;
  totalDisplay: string;
  paidDisplay?: string | null;
  dueDisplay?: string | null;
  currency: string;
}

export interface OrderTrackingPaymentViewModel {
  statusLabel: string;
  badgeVariant: "success" | "warning" | "danger" | "outline";
  methodLabel?: string | null;
  totalDisplay: string;
  instructions?: string | null;
  instructionsTitle?: string | null;
  voucherMessage?: string | null;
  voucherViewUrl?: string | null;
  voucherViewLabel?: string | null;
  stripePendingMessage?: string | null;
  failedMessage?: string | null;
  supportHint?: string | null;
}

export interface OrderTrackingLabelsViewModel {
  orderNumberLabel: string;
  placedAtLabel: string;
  statusLabel: string;
  shippingSectionTitle: string;
  pickupSectionTitle: string;
  summarySectionTitle: string;
  totalsSectionTitle: string;
  paymentSectionTitle: string;
  helpSectionTitle: string;
  methodNameLabel: string;
  pickupBranchLabel: string;
  addressLabel: string;
  referenceLabel: string;
  trackingCodeLabel: string;
  carrierLabel: string;
  unitPriceLabel: string;
  lineSubtotalLabel: string;
  subtotalLabel: string;
  quantityDiscountLabel: string;
  discountLabel: string;
  shippingLabel: string;
  taxLabel: string;
  totalLabel: string;
  paidLabel: string;
  dueLabel: string;
  paymentStatusFieldLabel: string;
  paymentMethodFieldLabel: string;
  totalFieldLabel: string;
  appliedCodeLabel: string;
  appliedPromotionLabel: string;
  totalProductsAfterDiscountLabel: string;
  imagePlaceholder: string;
  continueShoppingLabel: string;
  kitIncludesLabel?: string;
}

export interface OrderTrackingDeliveryGroupViewModel {
  groupId: string;
  role: "together" | "immediate" | "prepared";
  status: string;
  lineIds: readonly string[];
  trackingNumber?: string | null;
  carrierName?: string | null;
  estimatedReadyAt?: string | null;
  estimatedDeliveryAt?: string | null;
}

export interface OrderTrackingViewModel {
  orderNumber: string;
  orgName: string;
  placedAtDisplay: string;
  statusHeadline: string;
  statusDescription?: string | null;
  statusSummaryLabel: string;
  isOrderCancelled: boolean;
  cancelledBanner?: string | null;
  milestones: OrderTrackingMilestoneViewModel[];
  lines: OrderTrackingLineViewModel[];
  shipping: OrderTrackingShippingViewModel | null;
  totals: OrderTrackingTotalsViewModel;
  payment: OrderTrackingPaymentViewModel | null;
  appliedCouponCode?: string | null;
  appliedPromotionLabel?: string | null;
  continueHref: string;
  continueLabel: string;
  contactHref?: string | null;
  contactLabel?: string | null;
  labels: OrderTrackingLabelsViewModel;
  /** Ausente en pedidos legacy: se sigue usando el tracking plano. */
  deliveryPolicy?: "together" | "separate";
  deliveryGroups?: readonly OrderTrackingDeliveryGroupViewModel[];
}

export interface OrderTrackingViewProps {
  tracking: OrderTrackingViewModel;
}
