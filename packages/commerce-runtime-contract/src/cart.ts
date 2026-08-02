import type { SalesMode } from "./catalog";

export interface CartLimitsViewModel {
  maxLines?: number | null;
  maxQuantityPerLine?: number | null;
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
}
