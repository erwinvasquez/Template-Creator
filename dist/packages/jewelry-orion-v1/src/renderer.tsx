"use client";

import type { ReactNode } from "react";
import type { ContentPayload, TemplatePage } from "./content/types";
import { CartProvider } from "./lib/cart-context";
import { SiteContentProvider } from "./lib/site-content";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { HomeView } from "./components/pages/HomeView";
import { ShopView } from "./components/pages/ShopView";
import { ProductView } from "./components/pages/ProductView";
import { AtelierView } from "./components/pages/AtelierView";

export function JewelryApp({
  page,
  payload,
  basePath,
  slug,
}: {
  page: TemplatePage;
  payload: ContentPayload;
  basePath: string;
  slug?: string;
}) {
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
    case "atelier":
      view = <AtelierView />;
      break;
    default:
      view = null;
  }

  const showCart = payload.features?.cart !== false;

  return (
    <SiteContentProvider payload={payload} basePath={basePath}>
      <CartProvider>
        <Header />
        <main className="flex-1">{view}</main>
        <Footer />
        {showCart ? <CartDrawer /> : null}
      </CartProvider>
    </SiteContentProvider>
  );
}
