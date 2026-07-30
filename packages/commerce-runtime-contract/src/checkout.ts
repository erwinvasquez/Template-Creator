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
  imageUrl?: string | null;
}

export interface CheckoutTotalsViewModel {
  subtotalDisplay: string;
  shippingDisplay?: string | null;
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
}

export interface CheckoutPreviewInput {
  shippingMethodId?: string | null;
  pickupBranchId?: string | null;
  paymentMethodId?: string | null;
  customerEmail?: string | null;
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
}

export interface PlaceOrderResult {
  ok: boolean;
  orderId?: string | null;
  confirmationHref?: string | null;
  redirectUrl?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface OrderConfirmationViewModel {
  orderId: string;
  statusLabel: string;
  totals: CheckoutTotalsViewModel;
  lines: CheckoutLineViewModel[];
  message?: string | null;
}
