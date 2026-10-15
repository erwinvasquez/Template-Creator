import type { CapabilityLevel, CommerceTemplateCapabilities } from "./capabilities";

export type CommerceMode = "preview-only" | "runtime";

export interface CommerceManifestViews {
  productListing: boolean;
  productDetail: boolean;
  cartPage: boolean;
  cartDrawer: boolean;
  checkoutLayout: boolean;
  /** Full typed checkout page (preferred over layout+slots). */
  checkoutPage?: boolean;
  orderConfirmation: boolean;
  orderTracking?: boolean;
  accountLogin?: boolean;
  accountRegister?: boolean;
  accountDashboard?: boolean;
  accountOrders?: boolean;
}

export interface CommerceManifest {
  mode: CommerceMode;
  /** Required when mode === "runtime". */
  contractVersion: string | null;
  views: CommerceManifestViews;
  capabilities: Partial<CommerceTemplateCapabilities> &
    Record<string, CapabilityLevel | undefined>;
}
