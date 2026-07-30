/**
 * Capability = technical support, NOT permanent UI presence.
 *
 * Templates decide whether search is a bar/icon/modal, filters are chips/drawer,
 * etc. Never render empty sections only because a capability is "supported".
 */
export type CapabilityLevel =
  | "required"
  | "supported"
  | "unsupported"
  | "host-controlled"
  | "required-when-applicable";

export interface CommerceTemplateCapabilities {
  productListing: CapabilityLevel;
  search: CapabilityLevel;
  categoryFilter: CapabilityLevel;
  collectionFilter: CapabilityLevel;
  brandFilter: CapabilityLevel;
  sorting: CapabilityLevel;
  cursorPagination: CapabilityLevel;

  productDetail: CapabilityLevel;
  variantSelector: CapabilityLevel;
  gallery: CapabilityLevel;
  stockIndicator: CapabilityLevel;
  relatedProducts: CapabilityLevel;

  cartDrawer: CapabilityLevel;
  cartPage: CapabilityLevel;

  checkoutLayout: CapabilityLevel;
  checkoutMapPicker: CapabilityLevel;
  paymentVoucherUpload: CapabilityLevel;

  taxCalculation: CapabilityLevel;
  shippingCalculation: CapabilityLevel;
  inventoryValidation: CapabilityLevel;
  placeOrder: CapabilityLevel;
}

export const DEFAULT_PREVIEW_CAPABILITIES: CommerceTemplateCapabilities = {
  productListing: "required",
  search: "supported",
  categoryFilter: "supported",
  collectionFilter: "supported",
  brandFilter: "supported",
  sorting: "required",
  cursorPagination: "required",
  productDetail: "required",
  variantSelector: "required-when-applicable",
  gallery: "supported",
  stockIndicator: "supported",
  relatedProducts: "supported",
  cartDrawer: "supported",
  cartPage: "supported",
  checkoutLayout: "supported",
  checkoutMapPicker: "unsupported",
  paymentVoucherUpload: "unsupported",
  taxCalculation: "host-controlled",
  shippingCalculation: "host-controlled",
  inventoryValidation: "host-controlled",
  placeOrder: "host-controlled",
};
