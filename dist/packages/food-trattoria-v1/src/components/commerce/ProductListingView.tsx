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
    <div className="trattoria-listing">
      <SalesModeShopBanner filters={filters} capabilities={capabilities} />
      {showSearch && (
        <form
          className="mb-10"
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
            className="w-full max-w-lg rounded-lg border border-border bg-background px-5 py-3.5 text-sm text-primary outline-none transition-colors focus:border-secondary"
          />
        </form>
      )}

      {showCategories && (
        <div className="category-scroll -mx-6 mb-12 flex gap-2 overflow-x-auto px-6 md:-mx-8 md:px-8">
          <button
            type="button"
            onClick={() => actions.setCatalogFilters({ categoryId: null })}
            className={`shrink-0 cursor-pointer rounded-full border px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ${
              !filters.activeCategoryId
                ? "border-secondary bg-secondary text-background"
                : "border-border text-secondary hover:border-secondary/60 hover:text-primary"
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
                className={`shrink-0 cursor-pointer rounded-full border px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ${
                  active
                    ? "border-secondary bg-secondary text-background"
                    : "border-border text-secondary hover:border-secondary/60 hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

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
