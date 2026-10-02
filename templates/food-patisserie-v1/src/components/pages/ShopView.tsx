"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { shouldShowCatalogEntrySelector } from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { useCommerceCapabilities } from "../../lib/commerce-host";
import { SHOP_QUERY } from "../../content/resolve";
import { CommerceAwareCatalog } from "../CommerceAwareCatalog";
import { SalesModeShopSwitch } from "../commerce/SalesModeShopBanner";

function ShopCatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-surface" />
          <div className="mt-4 h-4 w-2/3 bg-surface" />
          <div className="mt-2 h-3 w-1/3 bg-surface" />
        </div>
      ))}
    </div>
  );
}

function ShopSalesModeSwitch() {
  const capabilities = useCommerceCapabilities();
  const searchParams = useSearchParams();
  const showCatalogEntry = shouldShowCatalogEntrySelector(
    capabilities,
    searchParams.get(SHOP_QUERY.salesMode),
  );
  if (showCatalogEntry) return null;
  return <SalesModeShopSwitch />;
}

export function ShopView() {
  const { payload } = useSiteContent();
  const shop = payload.sections.shop;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <header className="mb-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p
            data-wb-slot="shop.eyebrow"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary"
          >
            {shop.eyebrow}
          </p>
          <Suspense fallback={null}>
            <ShopSalesModeSwitch />
          </Suspense>
        </div>
        <h1
          data-wb-slot="shop.title"
          className="mt-3 font-serif text-4xl tracking-wide md:text-5xl"
        >
          {shop.title}
        </h1>
        <p
          data-wb-slot="shop.description"
          className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base"
        >
          {shop.description}
        </p>
      </header>

      <Suspense fallback={<ShopCatalogSkeleton />}>
        <CommerceAwareCatalog />
      </Suspense>
    </div>
  );
}
