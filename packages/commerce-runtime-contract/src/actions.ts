import type { CatalogFilterPatch, CatalogSessionViewModel, SalesMode } from "./catalog";
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

  /** Reemplaza el snapshot aplicado desde URL (no merge parcial). */
  replaceCatalogAppliedState?(filters: CatalogFilterPatch): void;

  loadMoreProducts(cursor?: string): Promise<CatalogSessionViewModel>;

  getCatalogSession?(): CatalogSessionViewModel;

  recordPlpScrollPosition?(scrollY: number): void;

  restorePlpScrollPosition?(): void;

  preparePlpNavigation?(): void;

  /** Entrada nueva a tienda: descarta sesión PLP/PDP persistida. */
  clearCatalogNavigationSession?(): void;

  /** Tras restaurar URL de retorno PLP (mantiene href para PDP). */
  clearCatalogReturnNavigation?(): void;

  selectVariant(variantId: string): void;

  addToCart(
    variantId: string,
    quantity?: number,
    options?: {
      selectedSalesMode?: SalesMode;
      /** UUID por interacción. El mismo reintento lo reutiliza. 1.1 puede omitirlo. */
      mutationId?: string;
      kitSelections?: ReadonlyArray<{
        slotId: string;
        componentProductId: string;
        componentVariantId: string;
        quantityPerKit: number;
      }>;
    },
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
