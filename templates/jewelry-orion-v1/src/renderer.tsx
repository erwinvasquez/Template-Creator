"use client";

import { useMemo, type ReactNode } from "react";
import type { TemplateAppProps } from "@shopenlinea/commerce-runtime-contract";
import type { ContentPayload } from "./content/types";
import type { OrionCommerceHost } from "./lib/commerce-host";
import { OrionCommerceProvider } from "./lib/commerce-host";
import { createPayloadCommerceBridge } from "./preview/createPayloadCommerceBridge";
import { SiteContentProvider } from "./lib/site-content";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { HomeView } from "./components/pages/HomeView";
import { ShopView } from "./components/pages/ShopView";
import { ProductView } from "./components/pages/ProductView";
import { AtelierView } from "./components/pages/AtelierView";
import { CartView } from "./components/pages/CartView";
import { CheckoutPage } from "./components/commerce/CheckoutPage";
import { OrderConfirmationView } from "./components/commerce/OrderConfirmationView";
import { AccountLoginForm } from "./components/account/AccountLoginForm";
import { AccountRegisterForm } from "./components/account/AccountRegisterForm";
import { AccountDashboard } from "./components/account/AccountDashboard";

/** @deprecated Prefer TemplateAppPage */
export type JewelryAppPage = TemplateAppProps<
  ContentPayload,
  OrionCommerceHost
>["page"];

export type TemplateAppPage = JewelryAppPage;

export type OrionTemplateAppProps = TemplateAppProps<
  ContentPayload,
  OrionCommerceHost
>;

/**
 * Pages the renderer can mount. `TemplatePage` entries come from
 * `manifest.routes[]`; cart/checkout/account URLs are resolved by the platform.
 */
export function JewelryApp({
  page,
  payload,
  basePath,
  slug,
  commerceHost,
  checkoutPage,
  orderConfirmation,
  accountLogin,
  accountRegister,
  accountDashboard,
  customMain,
}: OrionTemplateAppProps) {
  const showCart = payload.features?.cart !== false;

  const resolvedHost = useMemo(
    () => commerceHost ?? createPayloadCommerceBridge(payload),
    [commerceHost, payload],
  );

  let view: ReactNode;
  switch (page) {
    case "home":
      view = <HomeView />;
      break;
    case "shop":
      view = <ShopView />;
      break;
    case "product":
      view = <ProductView slug={slug ?? ""} />;
      break;
    case "about":
      view = <AtelierView />;
      break;
    case "cart":
      view = <CartView />;
      break;
    case "checkout":
      view = checkoutPage ? <CheckoutPage {...checkoutPage} /> : null;
      break;
    case "orderConfirmation":
      view = orderConfirmation ? (
        <OrderConfirmationView {...orderConfirmation} />
      ) : null;
      break;
    case "accountLogin":
      view = accountLogin ? <AccountLoginForm {...accountLogin} /> : null;
      break;
    case "accountRegister":
      view = accountRegister ? (
        <AccountRegisterForm {...accountRegister} />
      ) : null;
      break;
    case "accountDashboard":
      view = accountDashboard ? (
        <AccountDashboard {...accountDashboard} />
      ) : null;
      break;
    default:
      view = null;
  }

  const tree = (
    <SiteContentProvider payload={payload} basePath={basePath}>
      <Header />
      <main className="flex-1">{customMain ?? view}</main>
      <Footer />
      {showCart ? <CartDrawer /> : null}
    </SiteContentProvider>
  );

  return (
    <OrionCommerceProvider host={resolvedHost}>{tree}</OrionCommerceProvider>
  );
}

/** Canonical plug-and-play export (alias of JewelryApp). */
export const TemplateApp = JewelryApp;
