import type { CommerceRuntimeActions } from "./actions";
import type { CartViewModel } from "./cart";
import type {
  CatalogQueryViewModel,
  ProductFilterViewModel,
  ProductSearchViewModel,
  SalesMode,
} from "./catalog";
import type { CheckoutViewModel } from "./checkout";
import type { ProductDetailViewModel } from "./product";

export interface CreateCommerceRuntimeBridgeInput {
  orgSlug: string;
  orgId: string;
  salesMode: SalesMode;
  isCustomDomain: boolean;
}

/**
 * Host-facing bridge shape. Implemented by Mock Bridge (this workspace)
 * or by the SaaS (outside this repo). Templates never import host internals.
 */
export interface CommerceRuntimeBridge {
  getProductListing(query: CatalogQueryViewModel): Promise<{
    data: ProductSearchViewModel;
    filters: ProductFilterViewModel;
  }>;

  getProductDetail(productSlug: string): Promise<ProductDetailViewModel | null>;

  getCart(): Promise<CartViewModel>;

  getCheckout?(): Promise<CheckoutViewModel>;

  actions: CommerceRuntimeActions;
}
