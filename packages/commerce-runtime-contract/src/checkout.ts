import type { SalesMode } from "./catalog";
import type { PaymentMethodViewModel } from "./payments";
import type {
  FulfillmentPromiseViewModel,
  PickupBranchViewModel,
  ShippingMethodViewModel,
} from "./shipping";

export interface CheckoutLineViewModel {
  lineId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  lineDisplayPrice: string;
  /** Subtotal catálogo tachado cuando hubo descuento en el snapshot de la orden. */
  compareAtDisplay?: string | null;
  imageUrl?: string | null;
  /** Detalle del kit. No son líneas de precio. */
  kitIncludes?: ReadonlyArray<{ label: string; quantity: number }> | null;
}

export interface CheckoutTotalsViewModel {
  subtotalDisplay: string;
  quantityDiscountDisplay?: string | null;
  shippingDisplay?: string | null;
  /** Cuando el envío aún no tiene monto (cotización manual, etc.). */
  shippingPendingLabel?: string | null;
  discountDisplay?: string | null;
  taxDisplay?: string | null;
  totalDisplay: string;
  currency: string;
}

export interface AppliedPromotionViewModel {
  id: string;
  label: string;
  amountDisplay?: string | null;
}

export interface CheckoutViewModel {
  requiresShipping: boolean;
  shippingSelectionPending: boolean;
  lines: CheckoutLineViewModel[];
  totals: CheckoutTotalsViewModel;
  shippingMethods: ShippingMethodViewModel[];
  paymentMethods: PaymentMethodViewModel[];
  pickupBranches: PickupBranchViewModel[];
  appliedPromotions: AppliedPromotionViewModel[];
  fulfillmentPromise?: FulfillmentPromiseViewModel | null;
  salesMode: SalesMode;
  madeToOrderAcceptingOrders?: boolean;
  deliveryPlan?: CheckoutDeliveryPlanViewModel | null;
}

export type DeliveryPolicy = "together" | "separate";

export type DeliveryGroupRole = "together" | "immediate" | "prepared";

export interface CheckoutDeliveryGroupViewModel {
  groupId: string;
  role: DeliveryGroupRole;
  lineIds: readonly string[];
  estimatedReadyAt: string | null;
  preparationPromiseLabel?: string | null;
  shippingMethods: readonly ShippingMethodViewModel[];
  selectedShippingMethodId?: string | null;
  shippingAmount: number;
  currency: string;
}

export interface CheckoutDeliveryPlanViewModel {
  policy: DeliveryPolicy;
  separateAvailable: boolean;
  groups: readonly CheckoutDeliveryGroupViewModel[];
  fingerprint: string;
  quotedAt: string;
  expiresAt: string;
}

export interface CheckoutPreviewInput {
  shippingMethodId?: string | null;
  pickupBranchId?: string | null;
  paymentMethodId?: string | null;
  customerEmail?: string | null;
  deliveryPolicy?: DeliveryPolicy;
  deliverySelections?: readonly {
    groupId: string;
    shippingMethodId: string;
    shippingContext?: unknown;
  }[];
  deliveryPlanFingerprint?: string;
}

export interface CheckoutPreviewResult {
  ok: boolean;
  checkout: CheckoutViewModel;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface PlaceOrderInput {
  shippingMethodId?: string | null;
  pickupBranchId?: string | null;
  paymentMethodId: string;
  customer: {
    email: string;
    fullName: string;
    phone?: string | null;
  };
  deliveryPolicy?: DeliveryPolicy;
  deliverySelections?: readonly {
    groupId: string;
    shippingMethodId: string;
    shippingContext?: unknown;
  }[];
  deliveryPlanFingerprint?: string;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderId?: string | null;
  confirmationHref?: string | null;
  redirectUrl?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface OrderConfirmationActionsViewModel {
  trackingHref: string;
  continueShoppingHref: string;
  trackingLabel: string;
  continueShoppingLabel: string;
}

export interface OrderConfirmationViewModel {
  orderId: string;
  statusLabel: string;
  totals: CheckoutTotalsViewModel;
  lines: CheckoutLineViewModel[];
  message?: string | null;
}
