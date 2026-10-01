import type { CatalogFilterPatch, ProductSearchViewModel } from "./catalog";
import type {
  CheckoutPreviewInput,
  CheckoutPreviewResult,
  PlaceOrderInput,
  PlaceOrderResult,
} from "./checkout";
import type { CommerceActionResult } from "./errors";

/**
 * Public host actions. Templates call these; hosts (Mock Bridge or SaaS) implement them.
 * No business logic lives in the contract package.
 */
export interface CommerceRuntimeActions {
  setCatalogFilters(filters: CatalogFilterPatch): void;

  loadMoreProducts(cursor: string): Promise<ProductSearchViewModel>;

  selectVariant(variantId: string): void;

  addToCart(
    variantId: string,
    quantity?: number,
  ): Promise<CommerceActionResult>;

  updateCartQuantity(
    variantId: string,
    quantity: number,
  ): Promise<CommerceActionResult>;

  removeCartLine(variantId: string): Promise<CommerceActionResult>;

  clearCart(): Promise<CommerceActionResult>;

  openCartDrawer(): void;

  /** Post-add UX: drawer en desktop; toast/badge en móvil. */
  confirmAddToCartSuccess(variantId?: string): void;

  navigateToCheckout(): void;

  previewCheckout(input: CheckoutPreviewInput): Promise<CheckoutPreviewResult>;

  placeOrder(
    input: PlaceOrderInput,
    idempotencyKey: string,
  ): Promise<PlaceOrderResult>;

  uploadPaymentVoucher(
    paymentId: string,
    file: File,
  ): Promise<CommerceActionResult>;
}
