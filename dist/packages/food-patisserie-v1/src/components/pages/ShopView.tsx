"use client";

import { Suspense } from "react";
import {
  catalogPageContainerClassName,
  CatalogPlpShopHeader,
} from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { CommerceAwareCatalog } from "../CommerceAwareCatalog";

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

export function ShopView() {
  const { payload } = useSiteContent();
  const shop = payload.sections.shop;

  return (
    <div className={catalogPageContainerClassName} data-commerce-plp-shell>
      <CatalogPlpShopHeader
        eyebrow={shop.eyebrow}
        title={shop.title}
        description={shop.description}
      />
      <Suspense fallback={<ShopCatalogSkeleton />}>
        <CommerceAwareCatalog />
      </Suspense>
    </div>
  );
}
