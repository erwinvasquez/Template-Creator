"use client";

import { Suspense } from "react";
import { useSiteContent } from "../../lib/site-content";
import { CommerceAwareCatalog } from "../CommerceAwareCatalog";

function ShopCatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse border-2 border-primary">
          <div className="aspect-square bg-surface" />
          <div className="mt-4 h-4 w-2/3 bg-surface" />
        </div>
      ))}
    </div>
  );
}

export function ShopView() {
  const { payload } = useSiteContent();
  const shop = payload.sections.shop;

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <header className="bg-primary px-6 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <p
            data-wb-slot="shop.eyebrow"
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary"
          >
            {shop.eyebrow}
          </p>
          <h1
            data-wb-slot="shop.title"
            className="mt-3 font-serif text-4xl font-bold uppercase tracking-tight text-background md:text-6xl"
          >
            {shop.title}
          </h1>
          <p
            data-wb-slot="shop.description"
            className="mt-4 max-w-xl text-sm leading-relaxed text-background/85 md:text-base"
          >
            {shop.description}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pt-10 md:px-8">
        <Suspense fallback={<ShopCatalogSkeleton />}>
          <CommerceAwareCatalog />
        </Suspense>
      </div>
    </div>
  );
}
