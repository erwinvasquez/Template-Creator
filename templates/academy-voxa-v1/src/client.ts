/** Client-safe entry — no Node fs / loadPayload. Plug-and-play Phase 0 API. */
export {
  TemplateApp,
  VoxaApp,
  type TemplateAppPage,
  type VoxaAppPage,
  type VoxaTemplateAppProps,
} from "./renderer";
export { TEMPLATE_ID, TEMPLATE_SLUG, DEFAULT_BASE_PATH } from "./meta";
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
export {
  VoxaCommerceProvider as TemplateCommerceProvider,
  VoxaCommerceProvider,
  useVoxaCommerceHost,
  useRequiredCommerceHost,
  useHostCart,
} from "./lib/commerce-host";
export type { VoxaCommerceHost } from "./lib/commerce-host";
export type { VoxaCommerceHost as TemplateCommerceHost } from "./lib/commerce-host";
export { createPayloadCommerceBridge } from "./preview/createPayloadCommerceBridge";
export {
  accountPath,
  resolveNavHref,
  SHOP_PATH,
  SHOP_QUERY,
  withBasePath,
} from "./content/resolve";
export { ProductListingView } from "./components/commerce/ProductListingView";
export { ProductDetailCommerceView } from "./components/commerce/ProductDetailCommerceView";
export { CommerceCartDrawer } from "./components/commerce/CommerceCartDrawer";
export { CartPageView } from "./components/commerce/CartPageView";
export { CheckoutLayout } from "./components/commerce/CheckoutLayout";
export { CheckoutPage } from "./components/commerce/CheckoutPage";
export { CheckoutCustomerFields } from "./components/commerce/CheckoutCustomerFields";
export { CheckoutShippingSelector } from "./components/commerce/CheckoutShippingSelector";
export { CheckoutPaymentSelector } from "./components/commerce/CheckoutPaymentSelector";
export { CheckoutDiscountCode } from "./components/commerce/CheckoutDiscountCode";
export { CheckoutOrderSummary } from "./components/commerce/CheckoutOrderSummary";
export { CheckoutSubmitActions } from "./components/commerce/CheckoutSubmitActions";
export { OrderConfirmationView } from "./components/commerce/OrderConfirmationView";
export { CommerceProductCard } from "./components/commerce/CommerceProductCard";
export { AccountLoginForm } from "./components/account/AccountLoginForm";
export { AccountRegisterForm } from "./components/account/AccountRegisterForm";
export { AccountDashboard } from "./components/account/AccountDashboard";

import type { CommerceTemplateViews } from "@shopenlinea/commerce-runtime-contract";
import { ProductListingView } from "./components/commerce/ProductListingView";
import { ProductDetailCommerceView } from "./components/commerce/ProductDetailCommerceView";
import { CommerceCartDrawer } from "./components/commerce/CommerceCartDrawer";
import { CartPageView } from "./components/commerce/CartPageView";
import { CheckoutLayout } from "./components/commerce/CheckoutLayout";
import { CheckoutPage } from "./components/commerce/CheckoutPage";
import { CheckoutCustomerFields } from "./components/commerce/CheckoutCustomerFields";
import { CheckoutShippingSelector } from "./components/commerce/CheckoutShippingSelector";
import { CheckoutPaymentSelector } from "./components/commerce/CheckoutPaymentSelector";
import { CheckoutDiscountCode } from "./components/commerce/CheckoutDiscountCode";
import { CheckoutOrderSummary } from "./components/commerce/CheckoutOrderSummary";
import { CheckoutSubmitActions } from "./components/commerce/CheckoutSubmitActions";
import { OrderConfirmationView } from "./components/commerce/OrderConfirmationView";
import { AccountLoginForm } from "./components/account/AccountLoginForm";
import { AccountRegisterForm } from "./components/account/AccountRegisterForm";
import { AccountDashboard } from "./components/account/AccountDashboard";

export const commerceViews: CommerceTemplateViews = {
  ProductListing: ProductListingView,
  ProductDetail: ProductDetailCommerceView,
  CartPage: CartPageView,
  CartDrawer: CommerceCartDrawer,
  CheckoutPage,
  CheckoutLayout,
  CheckoutCustomerFields,
  CheckoutShippingSelector,
  CheckoutPaymentSelector,
  CheckoutDiscountCode,
  CheckoutOrderSummary,
  CheckoutSubmitActions,
  OrderConfirmation: OrderConfirmationView,
  AccountLoginForm,
  AccountRegisterForm,
  AccountDashboard,
};

/** @deprecated Prefer commerceViews */
export const voxaCommerceViews = commerceViews;
