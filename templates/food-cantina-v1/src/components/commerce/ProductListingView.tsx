"use client";

import { useState } from "react";
import type { ProductListingViewProps } from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { requireUi } from "../../lib/ui";
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
}: ProductListingViewProps) {
  const { payload } = useSiteContent();
  const ui = requireUi(payload);
  const listing = ui.listing;
  const shop = ui.shop;
  const [search, setSearch] = useState(filters.searchQuery ?? "");
  const [busy, setBusy] = useState(false);
  const [extra, setExtra] = useState(data.products);
  const [cursor, setCursor] = useState(data.nextCursor);

  const products = extra.length ? extra : data.products;
  const showSearch =
    capabilities.search !== "unsupported" &&
    (filters.categories.length > 0 || data.products.length > 0 || Boolean(filters.searchQuery));
  const showCategories =
    capabilities.categoryFilter !== "unsupported" && filters.categories.length > 0;

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
    <div className="cantina-listing">
      <SalesModeShopBanner filters={filters} capabilities={capabilities} />
      {showSearch && (
        <form
          className="mb-8 border-2 border-primary bg-background p-4 shadow-[4px_4px_0_0_var(--color-secondary)]"
          onSubmit={(e) => {
            e.preventDefault();
            actions.setCatalogFilters({ searchQuery: search || null });
            setExtra([]);
            setCursor(null);
          }}
        >
          <label className="sr-only" htmlFor="commerce-search">
            {listing.searchLabel}
          </label>
          <input
            id="commerce-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={listing.searchPlaceholder}
            className="w-full border-0 bg-transparent px-2 py-2 text-sm font-bold uppercase tracking-wide text-primary outline-none placeholder:text-muted"
          />
        </form>
      )}

      {showCategories && (
        <div className="category-scroll -mx-6 mb-10 flex gap-1 overflow-x-auto bg-primary px-6 py-3 md:-mx-8 md:px-8">
          <button
            type="button"
            onClick={() => actions.setCatalogFilters({ categoryId: null })}
            className={`shrink-0 cursor-pointer px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
              !filters.activeCategoryId
                ? "bg-secondary text-background"
                : "text-background/80 hover:bg-background/10 hover:text-background"
            }`}
          >
            {listing.allCategories}
          </button>
          {filters.categories.map((cat) => {
            const active = filters.activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  actions.setCatalogFilters({ categoryId: active ? null : cat.id })
                }
                className={`shrink-0 cursor-pointer px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
                  active
                    ? "bg-secondary text-background"
                    : "text-background/80 hover:bg-background/10 hover:text-background"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {errorMessage && (
        <p className="mb-8 text-sm font-bold text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p className="py-20 text-center text-lg font-bold uppercase text-muted">{listing.loading}</p>
      ) : products.length === 0 ? (
        <p className="py-20 text-center font-bold uppercase text-muted">
          {filters.searchQuery ? listing.noSearchResults : shop.empty}
        </p>
      ) : (
        <>
          <p className="mb-8 text-sm font-bold uppercase tracking-wider text-secondary">
            {products.length}{" "}
            {products.length === 1 ? listing.pieceSingular : listing.piecePlural}
            {cursor ? "+" : ""}
          </p>
          <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-2">
            {products.map((product, i) => (
              <CommerceProductCard
                key={product.id}
                product={product}
                priority={i < 4}
              />
            ))}
          </div>
          {capabilities.cursorPagination !== "unsupported" && cursor && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                disabled={busy || loadingMore}
                onClick={onLoadMore}
                className="cursor-pointer border-2 border-primary bg-secondary px-10 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-background shadow-[4px_4px_0_0_var(--color-primary)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-primary)] disabled:opacity-50"
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
