"use client";

import { Suspense } from "react";
import { useSiteContent } from "../../lib/site-content";
import { CommerceAwareCatalog } from "../CommerceAwareCatalog";
import { SalesModeShopSwitch } from "../commerce/SalesModeShopBanner";

function ShopCatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-xl bg-surface" />
          <div className="mt-5 h-4 w-2/3 bg-surface" />
          <div className="mt-2 h-3 w-1/3 bg-surface" />
        </div>
      ))}
    </div>
  );
}

export function ShopView() {
  const { payload } = useSiteContent();
  const shop = payload.sections.shop;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <header className="mb-14 border-b-2 border-secondary/40 pb-10 text-center md:text-left">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p
            data-wb-slot="shop.eyebrow"
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary"
          >
            {shop.eyebrow}
          </p>
          <Suspense fallback={null}>
            <SalesModeShopSwitch />
          </Suspense>
        </div>
        <h1
          data-wb-slot="shop.title"
          className="mt-4 font-serif text-4xl tracking-wide text-primary md:text-5xl lg:text-6xl"
        >
          {shop.title}
        </h1>
        <p
          data-wb-slot="shop.description"
          className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted md:mx-0 md:text-base"
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
