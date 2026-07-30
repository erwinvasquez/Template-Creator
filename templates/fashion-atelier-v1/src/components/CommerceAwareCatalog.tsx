"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import type {
  ProductFilterViewModel,
  ProductSearchViewModel,
} from "@shopenlinea/commerce-runtime-contract";
import {
  useCommerceCapabilities,
  useRequiredCommerceHost,
} from "../lib/commerce-host";
import { useSiteContent } from "../lib/site-content";
import { SHOP_QUERY } from "../content/resolve";
import { ProductListingView } from "./commerce/ProductListingView";

export function CommerceAwareCatalog() {
  const host = useRequiredCommerceHost();
  const capabilities = useCommerceCapabilities();
  const { payload } = useSiteContent();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get(SHOP_QUERY.category);
  const collectionSlug = searchParams.get(SHOP_QUERY.collection);

  const [data, setData] = useState<ProductSearchViewModel | null>(null);
  const [filters, setFilters] = useState<ProductFilterViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => host.subscribe(() => setTick((t) => t + 1)), [host]);

  useEffect(() => {
    const categoryId =
      payload.catalog.categories.find((c) => c.slug === categorySlug)?.id ??
      null;
    const collectionId =
      payload.catalog.collections.find((c) => c.slug === collectionSlug)?.id ??
      null;
    host.actions.setCatalogFilters({
      categoryId,
      collectionId,
      searchQuery: null,
    });
  }, [host, payload.catalog.categories, payload.catalog.collections, categorySlug, collectionSlug]);

  useEffect(() => {
    let cancelled = false;
    void host
      .getListing()
      .then((res) => {
        if (cancelled) return;
        startTransition(() => {
          setData(res.data);
          setFilters(res.filters);
          setError(null);
        });
      })
      .catch(() => {
        if (!cancelled) {
          startTransition(() => {
            setError("No se pudo cargar el catálogo.");
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [host, tick, categorySlug, collectionSlug]);

  if (!data || !filters) {
    return (
      <p className="py-20 text-center text-muted">
        {error ?? "Cargando…"}
      </p>
    );
  }

  return (
    <ProductListingView
      key={`${filters.searchQuery ?? ""}-${filters.activeCategoryId ?? ""}-${categorySlug ?? ""}-${collectionSlug ?? ""}-${data.nextCursor ?? "end"}-${data.products.map((p) => p.id).join(",")}`}
      data={data}
      filters={filters}
      capabilities={capabilities}
      actions={{
        setCatalogFilters: host.actions.setCatalogFilters,
        loadMoreProducts: host.actions.loadMoreProducts,
      }}
      loading={isPending}
      errorMessage={error}
    />
  );
}
