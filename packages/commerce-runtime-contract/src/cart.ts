import type { AppliedPromotionViewModel } from "./checkout";
import type { SalesMode } from "./catalog";
import type { CartLineQuantityPricingViewModel } from "./quantityPricingPresentation";

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

export type CartFulfillmentRole = "immediate" | "prepared";

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
  /** Total lista de línea (listUnitPrice × quantity) para compare en columna. */
  lineListOriginalTotal?: number;
  lineListOriginalTotalDisplay?: string | null;
  /** Descuento asignado a la línea. */
  lineDiscountAmount?: number;
  /** Subtotal final de la línea tras promociones. */
  lineFinalTotal?: number;
  lineOriginalDisplayPrice?: string | null;
  lineDiscountDisplay?: string | null;
  pricingAdjustments?: CartLinePricingAdjustmentViewModel[];
  /** Precio lista unitario (qty 1) antes de quantity pricing. */
  listUnitPrice?: number;
  /** Precio catálogo unitario post-tier, pre-promoción. */
  catalogUnitPrice?: number;
  quantityPricing?: CartLineQuantityPricingViewModel | null;
  options?: Array<{ name: string; value: string }>;
  /** Valor de preparación MTO, sin prefijo. Stock lo deja vacío. */
  preparationPromiseLabel?: string | null;
  /** Canal de la línea. El checkout lo deriva de aquí. */
  salesMode?: SalesMode;
  /** Hermanas stock/MTO comparten este id. Ausente en carritos legacy. */
  purchaseGroupId?: string | null;
  /**
   * `stock` → immediate, `madeToOrder` → prepared.
   * Ausente en legacy: el consumidor lo deriva de `salesMode`.
   */
  fulfillmentRole?: CartFulfillmentRole | null;
  /** Detalle del kit. No son líneas de precio. */
  kitIncludes?: ReadonlyArray<{ label: string; quantity: number }> | null;
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
  /** Subtotal LIST original cuando existe desglose quantity/promo. */
  subtotalOriginal?: number;
  subtotalOriginalDisplay?: string | null;
  /** Diferencia acumulada entre subtotal lista y catálogo post-tier. */
  quantityDiscountTotal?: number;
  quantityDiscountTotalDisplay?: string | null;
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

export function resolveCartLineFulfillmentRole(
  line: Pick<CartLineViewModel, "fulfillmentRole" | "salesMode">,
  cartSalesMode: SalesMode,
): CartFulfillmentRole {
  if (line.fulfillmentRole === "immediate" || line.fulfillmentRole === "prepared") {
    return line.fulfillmentRole;
  }
  if (line.salesMode === "madeToOrder") return "prepared";
  if (line.salesMode === "stock") return "immediate";
  return cartSalesMode === "madeToOrder" ? "prepared" : "immediate";
}

/**
 * Un carrito. El encabezado único solo aparece si todas las líneas comparten rol.
 * En un carrito mixto el encabezado queda vacío y cada línea lleva su etiqueta.
 */
export function resolveCartFulfillmentHeading(input: {
  cartSalesMode: SalesMode;
  lines: ReadonlyArray<Pick<CartLineViewModel, "fulfillmentRole" | "salesMode">>;
  immediateLabel: string;
  preparedLabel: string;
}): string | null {
  if (input.lines.length === 0) return null;
  const roles = input.lines.map((line) =>
    resolveCartLineFulfillmentRole(line, input.cartSalesMode),
  );
  if (roles.every((role) => role === "prepared")) return input.preparedLabel;
  if (roles.every((role) => role === "immediate")) return input.immediateLabel;
  return null;
}

export function cartLineRoleLabel(input: {
  line: Pick<CartLineViewModel, "fulfillmentRole" | "salesMode">;
  cartSalesMode: SalesMode;
  immediateLabel: string;
  preparedLabel: string;
  mixed: boolean;
}): string | null {
  if (!input.mixed) return null;
  return resolveCartLineFulfillmentRole(input.line, input.cartSalesMode) === "prepared"
    ? input.preparedLabel
    : input.immediateLabel;
}
