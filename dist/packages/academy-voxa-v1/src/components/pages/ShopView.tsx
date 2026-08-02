"use client";

import { Suspense } from "react";
import { useSiteContent } from "../../lib/site-content";
import { CommerceAwareCatalog } from "../CommerceAwareCatalog";

function ShopCatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-surface" />
          <div className="mt-4 h-4 w-2/3 bg-surface" />
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
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <header className="mb-12 max-w-2xl">
        <p
          data-wb-slot="shop.eyebrow"
          className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta"
        >
          {shop.eyebrow}
        </p>
        <h1
          data-wb-slot="shop.title"
          className="mt-3 font-serif text-4xl tracking-wide md:text-5xl"
        >
          {shop.title}
        </h1>
        <p
          data-wb-slot="shop.description"
          className="mt-4 text-sm leading-relaxed text-muted md:text-base"
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
