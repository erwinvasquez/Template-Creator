import type { AppliedPromotionViewModel } from "./checkout";
import type { SalesMode } from "./catalog";

export interface CartLimitsViewModel {
  maxLines?: number | null;
  maxQuantityPerLine?: number | null;
}

export type CartPricingStatus = "idle" | "updating" | "confirmed" | "error";

export type CartPromotionAnnouncementState = "progress" | "applied";

export type CartPromotionConditionKind = "minimumOrderAmount" | "buyXGetY" | "none";

export type CartPromotionRewardKind =
  | "percentageDiscount"
  | "fixedDiscount"
  | "freeShipping"
  | "buyXGetY"
  | "bundlePrice"
  | "volumePricing";

export type CartPromotionEligibleScope = "cart" | "product" | "category" | "collection";

export interface CartPromotionDestinationRefViewModel {
  kind: "category" | "collection";
  id: string;
}

export interface CartPromotionAnnouncementViewModel {
  promotionId: string;
  promotionName: string;
  announcementState: CartPromotionAnnouncementState;
  conditionKind: CartPromotionConditionKind;
  rewardKind: CartPromotionRewardKind;
  eligibleScope: CartPromotionEligibleScope;
  currentAmount?: number;
  currentQuantity?: number;
  requiredAmount?: number;
  requiredQuantity?: number;
  remainingAmount?: number;
  remainingQuantity?: number;
  currency: string;
  appliedDiscountAmount?: number;
  customStorefrontCopy?: string;
  destinationRef?: CartPromotionDestinationRefViewModel;
  percentOff?: number;
  fixedDiscountAmount?: number;
  priority?: number;
}

export interface CartLinePricingAdjustmentViewModel {
  sourceId: string;
  label: string;
  kind: string;
  amountDisplay?: string | null;
}

export interface CartLineViewModel {
  lineId: string;
  variantId: string;
  productId: string;
  productName: string;
  variantLabel: string;
  href: string;
  imageUrl: string | null;
  quantity: number;
  maxQuantity?: number | null;
  unitDisplayPrice: string;
  unitCompareAtPrice?: string | null;
  lineDisplayPrice: string;
  /** Precio unitario de catálogo antes de promociones (numérico). */
  unitOriginalPrice?: number;
  /** Precio unitario efectivo tras promociones (numérico). */
  unitEffectivePrice?: number;
  /** Subtotal de catálogo de la línea antes de promociones. */
  lineOriginalTotal?: number;
  /** Descuento asignado a la línea. */
  lineDiscountAmount?: number;
  /** Subtotal final de la línea tras promociones. */
  lineFinalTotal?: number;
  lineOriginalDisplayPrice?: string | null;
  lineDiscountDisplay?: string | null;
  pricingAdjustments?: CartLinePricingAdjustmentViewModel[];
  options?: Array<{ name: string; value: string }>;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface CartViewModel {
  cartId: string;
  salesMode: SalesMode;
  currency: string;
  itemsCount: number;
  subtotal: number;
  subtotalDisplay: string;
  requiresShipping: boolean;
  lines: CartLineViewModel[];
  cartLimits?: CartLimitsViewModel;
  /**
   * Dual-mode cart warning when `salesMode === "madeToOrder"` and channel is closed.
   * Templates show `ui.salesMode.madeToOrder.cartClosedWarning` when this is `false`.
   */
  madeToOrderAcceptingOrders?: boolean;
  cartHref: string;
  checkoutHref: string;
  promotionLabels?: string[];
  /** Subtotal de catálogo antes de descuentos automáticos. */
  subtotalOriginal?: number;
  subtotalOriginalDisplay?: string | null;
  discountTotal?: number;
  discountTotalDisplay?: string | null;
  subtotalPromotional?: number;
  subtotalPromotionalDisplay?: string | null;
  appliedPromotions?: AppliedPromotionViewModel[];
  promotionAnnouncements?: CartPromotionAnnouncementViewModel[];
  pricingStatus?: CartPricingStatus;
  pricingError?: string | null;
  /** True cuando el total mostrado no incluye envío definitivo. */
  estimatedTotal?: boolean;
  /** True while optimistic mutations are syncing with the server. */
  isSyncing?: boolean;
  /** Last cart sync error code, if any. */
  syncError?: string | null;
}
