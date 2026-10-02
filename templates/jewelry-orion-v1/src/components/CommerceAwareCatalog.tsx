"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import type {
  ProductFilterViewModel,
  ProductSearchViewModel,
} from "@shopenlinea/commerce-runtime-contract";
import {
  CatalogSalesModeEntrySelector,
  buildCatalogSalesModeEntryOptions,
  shouldShowCatalogEntrySelector,
} from "@shopenlinea/commerce-runtime-contract";
import {
  useCatalogListingTick,
  useCommerceCapabilities,
  useRequiredCommerceHost,
} from "../lib/commerce-host";
import { useSiteContent } from "../lib/site-content";
import { requireUi } from "../lib/ui";
import { SHOP_QUERY } from "../content/resolve";
import { ProductListingView } from "./commerce/ProductListingView";
import { modeHref } from "./commerce/SalesModeShopBanner";
import { parseSalesModeQuery, showsSalesModeChrome } from "../lib/sales-mode";

export function CommerceAwareCatalog() {
  const host = useRequiredCommerceHost();
  const capabilities = useCommerceCapabilities();
  const { payload, basePath } = useSiteContent();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get(SHOP_QUERY.category);
  const collectionSlug = searchParams.get(SHOP_QUERY.collection);
  const salesModeSlug = searchParams.get(SHOP_QUERY.salesMode);
  const searchQuery = searchParams.get(SHOP_QUERY.search);

  const [data, setData] = useState<ProductSearchViewModel | null>(null);
  const [filters, setFilters] = useState<ProductFilterViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tick = useCatalogListingTick();
  const [isPending, startTransition] = useTransition();

  const showCatalogEntry = shouldShowCatalogEntrySelector(
    capabilities,
    salesModeSlug,
  );

  useEffect(() => {
    const hasPayloadTaxonomy =
      payload.catalog.categories.length > 0 ||
      payload.catalog.collections.length > 0;
    // Preview/demo: resolve from payload. SaaS runtime: host resolves via taxonomy API.
    if (!hasPayloadTaxonomy) return;
    const categoryId =
      payload.catalog.categories.find((c) => c.slug === categorySlug)?.id ??
      null;
    const collectionId =
      payload.catalog.collections.find((c) => c.slug === collectionSlug)?.id ??
      null;
    host.actions.setCatalogFilters({
      categoryId,
      collectionId,
    });
  }, [host, payload.catalog.categories, payload.catalog.collections, categorySlug, collectionSlug]);

  useEffect(() => {
    if (!showsSalesModeChrome(capabilities)) return;
    const mode = parseSalesModeQuery(salesModeSlug);
    if (!mode) return;
    host.actions.setCatalogFilters({ salesMode: mode });
  }, [host, capabilities, salesModeSlug]);

  useEffect(() => {
    const trimmed = searchQuery?.trim() || null;
    host.actions.setCatalogFilters({ searchQuery: trimmed });
  }, [host, searchQuery]);

  useEffect(() => {
    if (showCatalogEntry) return;
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
            setError(requireUi(payload).errors.catalogLoadFailed);
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    host,
    tick,
    categorySlug,
    collectionSlug,
    salesModeSlug,
    searchQuery,
    payload,
    showCatalogEntry,
  ]);

  if (showCatalogEntry) {
    const ui = requireUi(payload);
    const heading =
      ui.salesMode.entryPrompt?.trim() || ui.chrome.salesModeAria;
    const options = buildCatalogSalesModeEntryOptions(ui.salesMode, (mode) =>
      modeHref(basePath, mode, searchParams),
    );
    return (
      <CatalogSalesModeEntrySelector heading={heading} options={options} />
    );
  }

  if (!data || !filters) {
    const listing = requireUi(payload).listing;
    return (
      <p className="py-20 text-center text-muted">
        {error ?? listing.loading}
      </p>
    );
  }

  return (
    <ProductListingView
      key={`${filters.searchQuery ?? ""}-${filters.activeCategoryId ?? ""}-${filters.salesMode}-${categorySlug ?? ""}-${collectionSlug ?? ""}-${salesModeSlug ?? ""}-${data.nextCursor ?? "end"}-${data.products.map((p) => p.id).join(",")}`}
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
