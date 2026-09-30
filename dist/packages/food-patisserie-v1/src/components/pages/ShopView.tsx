"use client";

import { Suspense } from "react";
import { useSiteContent } from "../../lib/site-content";
import { CommerceAwareCatalog } from "../CommerceAwareCatalog";

function ShopCatalogSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex animate-pulse gap-4 rounded-2xl p-4">
          <div className="h-28 w-28 shrink-0 rounded-2xl bg-surface" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-4 w-1/3 bg-surface" />
            <div className="h-6 w-2/3 bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShopView() {
  const { payload } = useSiteContent();
  const shop = payload.sections.shop;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
      <header className="mb-10 rounded-3xl bg-surface/70 p-8 md:p-10">
        <p
          data-wb-slot="shop.eyebrow"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
        >
          {shop.eyebrow}
        </p>
        <h1
          data-wb-slot="shop.title"
          className="mt-3 font-serif text-3xl leading-tight text-primary md:text-4xl"
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
