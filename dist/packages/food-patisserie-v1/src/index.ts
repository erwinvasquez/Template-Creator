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
  getCelebrationProducts,
  getViennoiserieProducts,
  getViennoiserieCollections,
  getProductBySlug,
  resolveMediaUrl,
  themeStyle,
  resolveNavHref,
  accountPath,
  SHOP_PATH,
  SHOP_QUERY,
} from "./content/resolve";
export {
  TemplateApp,
  PatisserieApp,
  type TemplateAppPage,
  type PatisserieAppPage,
  type PatisserieTemplateAppProps,
} from "./renderer";
export { TEMPLATE_ID, TEMPLATE_SLUG, DEFAULT_BASE_PATH } from "./meta";
export {
  PatisserieCommerceProvider as TemplateCommerceProvider,
  PatisserieCommerceProvider,
  usePatisserieCommerceHost,
  useRequiredCommerceHost,
  useHostCart,
} from "./lib/commerce-host";
export type { PatisserieCommerceHost, PatisserieCommerceHost as TemplateCommerceHost } from "./lib/commerce-host";
export { createPayloadCommerceBridge } from "./preview/createPayloadCommerceBridge";

export {
  ProductListingView,
  ProductDetailCommerceView,
  CommerceCartDrawer,
  CartPageView,
  CheckoutLayout,
  hostCheckoutSkin,
  OrderConfirmationView,
  CommerceProductCard,
  AccountLoginForm,
  AccountRegisterForm,
  AccountDashboard,
  commerceViews,
  patisserieCommerceViews,
} from "./client";
