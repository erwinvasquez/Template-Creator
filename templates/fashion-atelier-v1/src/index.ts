export type {
  ContentPayload,
  TemplatePage,
  ResolvedProduct,
  MediaRef,
  NavLink,
  PathNavLink,
  ShopFilterNavLink,
  Link,
} from "./content/types";
export { loadPayload, loadManifest, getPackageRoot } from "./content/load";
export { validatePayload } from "./content/validate";
export {
  withBasePath,
  formatPrice,
  resolveProducts,
  getFeaturedProducts,
  getHomeCollections,
  getProductBySlug,
  resolveMediaUrl,
  themeStyle,
  resolveNavHref,
  accountPath,
  SHOP_QUERY,
} from "./content/resolve";
export {
  TemplateApp,
  AtelierApp,
  type TemplateAppPage,
  type AtelierAppPage,
  type AtelierTemplateAppProps,
} from "./renderer";
export { TEMPLATE_ID, TEMPLATE_SLUG, DEFAULT_BASE_PATH } from "./meta";
export {
  AtelierCommerceProvider as TemplateCommerceProvider,
  AtelierCommerceProvider,
  useAtelierCommerceHost,
  useRequiredCommerceHost,
  useHostCart,
} from "./lib/commerce-host";
export type { AtelierCommerceHost, AtelierCommerceHost as TemplateCommerceHost } from "./lib/commerce-host";
export { createPayloadCommerceBridge } from "./preview/createPayloadCommerceBridge";

export {
  ProductListingView,
  ProductDetailCommerceView,
  CommerceCartDrawer,
  CartPageView,
  CheckoutLayout,
  CheckoutPage,
  CheckoutCustomerFields,
  CheckoutShippingSelector,
  CheckoutPaymentSelector,
  CheckoutDiscountCode,
  CheckoutOrderSummary,
  CheckoutSubmitActions,
  OrderConfirmationView,
  CommerceProductCard,
  AccountLoginForm,
  AccountRegisterForm,
  AccountDashboard,
  commerceViews,
  atelierCommerceViews,
} from "./client";
