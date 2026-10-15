"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CatalogFilterPatch, ProductListingViewProps } from "@shopenlinea/commerce-runtime-contract";
import {
  buildCatalogFilterPatchForNavigation,
  CatalogListingSearchAndFilter,
} from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { requireUi } from "../../lib/ui";
import { buildShopListingHref, SHOP_QUERY } from "../../content/resolve";
import { CommerceProductCard } from "./CommerceProductCard";
import { SalesModeShopBanner } from "./SalesModeShopBanner";

export function ProductListingView({
  data,
  filters,
  capabilities,
  actions,
  loading,
  loadingMore,
  errorMessage,
  listingQueryKey = "",
}: ProductListingViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { payload, basePath } = useSiteContent();
  const ui = requireUi(payload);
  const listing = ui.listing;
  const shop = ui.shop;
  const qFromUrl = searchParams.get(SHOP_QUERY.search) ?? "";
  const [search, setSearch] = useState(filters.searchQuery ?? qFromUrl);
  const [, startNavTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [extra, setExtra] = useState(data.products);
  const [cursor, setCursor] = useState(data.nextCursor);

  useEffect(() => {
    setSearch(filters.searchQuery ?? qFromUrl);
  }, [filters.searchQuery, qFromUrl]);

  useEffect(() => {
    setExtra(data.products);
    setCursor(data.nextCursor);
  }, [data.products, data.nextCursor, listingQueryKey]);

  function submitSearch() {
    const target = buildShopListingHref(basePath, searchParams, { q: search || null });
    startNavTransition(() => router.push(target));
  }

  const products = extra.length ? extra : data.products;
  const showSearch =
    capabilities.search !== "unsupported" &&
    (filters.categories.length > 0 || data.products.length > 0 || Boolean(filters.searchQuery));

  function applyCatalogFilters(patch: CatalogFilterPatch) {
    const full = buildCatalogFilterPatchForNavigation(searchParams, filters, patch, {
      defaultSalesMode: filters.salesMode,
      taxonomy: {
        categories: payload.catalog.categories,
        collections: payload.catalog.collections,
      },
    });
    const target = buildShopListingHref(basePath, searchParams, { filters: full });
    startNavTransition(() => router.push(target));
  }

  async function onLoadMore() {
    if (!cursor) return;
    setBusy(true);
    try {
      const next = await actions.loadMoreProducts(cursor);
      setExtra((prev) => [...prev, ...next.products]);
      setCursor(next.nextCursor);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="trattoria-listing">
      <SalesModeShopBanner filters={filters} capabilities={capabilities} />
      <CatalogListingSearchAndFilter
        capabilities={capabilities}
        salesModeUi={ui.salesMode}
        filters={filters}
        listing={listing}
        showSearch={showSearch}
        search={search}
        onSearchChange={setSearch}
        onSubmitSearch={submitSearch}
        onApplyFilters={applyCatalogFilters}
        searchInputClassName="max-w-md border border-border bg-background px-4 py-3 focus:border-primary"
      />

      {errorMessage && (
        <p className="mb-8 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p className="py-20 text-center font-serif text-lg text-muted">{listing.loading}</p>
      ) : products.length === 0 ? (
        <p className="py-20 text-center text-muted">
          {filters.searchQuery ? listing.noSearchResults : shop.empty}
        </p>
      ) : (
        <>
          <p className="mb-10 border-b border-border pb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {products.length}{" "}
            {products.length === 1 ? listing.pieceSingular : listing.piecePlural}
            {cursor ? "+" : ""}
          </p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
            {products.map((product, i) => (
              <CommerceProductCard
                key={product.id}
                product={product}
                priority={i < 3}
              />
            ))}
          </div>
          {capabilities.cursorPagination !== "unsupported" && cursor && (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                disabled={busy || loadingMore}
                onClick={onLoadMore}
                className="cursor-pointer rounded-full border border-primary px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary hover:text-background disabled:opacity-50"
              >
                {busy || loadingMore ? listing.loadingMore : listing.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
