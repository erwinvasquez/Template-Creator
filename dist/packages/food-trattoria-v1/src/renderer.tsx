"use client";

import { useMemo, type ReactNode } from "react";
import type { TemplateAppProps } from "@shopenlinea/commerce-runtime-contract";
import type { ContentPayload } from "./content/types";
import type { TrattoriaCommerceHost } from "./lib/commerce-host";
import { TrattoriaCommerceProvider } from "./lib/commerce-host";
import { createPayloadCommerceBridge } from "./preview/createPayloadCommerceBridge";
import { SiteContentProvider } from "./lib/site-content";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { HomeView } from "./components/pages/HomeView";
import { ShopView } from "./components/pages/ShopView";
import { ProductView } from "./components/pages/ProductView";
import { AboutView } from "./components/pages/AboutView";
import { CartView } from "./components/pages/CartView";
import { OrderConfirmationView } from "./components/commerce/OrderConfirmationView";
import { OrderTrackingView } from "./components/commerce/OrderTrackingView";
import { AccountLoginForm } from "./components/account/AccountLoginForm";
import { AccountRegisterForm } from "./components/account/AccountRegisterForm";
import { AccountDashboard } from "./components/account/AccountDashboard";

/** @deprecated Prefer TemplateAppPage */
export type TrattoriaAppPage = TemplateAppProps<
  ContentPayload,
  TrattoriaCommerceHost
>["page"];

export type TemplateAppPage = TrattoriaAppPage;

export type TrattoriaTemplateAppProps = TemplateAppProps<
  ContentPayload,
  TrattoriaCommerceHost
>;

export function TrattoriaApp({
  page,
  payload,
  basePath,
  slug,
  commerceHost,
  orderConfirmation,
  orderTracking,
  accountLogin,
  accountRegister,
  accountDashboard,
  customMain,
}: TrattoriaTemplateAppProps) {
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
      view = <AboutView />;
      break;
    case "cart":
      view = <CartView />;
      break;
    case "orderConfirmation":
      view = orderConfirmation ? (
        <OrderConfirmationView {...orderConfirmation} />
      ) : null;
      break;
    case "orderTracking":
      view = orderTracking ? (
        <OrderTrackingView {...orderTracking} />
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
    <TrattoriaCommerceProvider host={resolvedHost}>{tree}</TrattoriaCommerceProvider>
  );
}

/** Canonical plug-and-play export (alias of TrattoriaApp). */
export const TemplateApp = TrattoriaApp;
