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
    <div className="patisserie-listing">
      <SalesModeShopBanner filters={filters} capabilities={capabilities} />
      {showSearch && (
        <form
          className="mb-8"
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
            className="w-full rounded-2xl border border-border/80 bg-surface/60 px-5 py-4 text-sm text-primary outline-none transition-shadow focus:shadow-[0_8px_24px_-8px_rgba(120,53,15,0.15)]"
          />
        </form>
      )}

      {showCategories && (
        <div className="category-scroll -mx-6 mb-10 flex gap-2 overflow-x-auto rounded-2xl bg-surface/50 px-6 py-4 md:-mx-8 md:px-8">
          <button
            type="button"
            onClick={() => actions.setCatalogFilters({ categoryId: null })}
            className={`shrink-0 cursor-pointer rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all ${
              !filters.activeCategoryId
                ? "bg-primary text-background shadow-sm"
                : "text-muted hover:bg-background hover:text-primary"
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
                className={`shrink-0 cursor-pointer rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all ${
                  active
                    ? "bg-primary text-background shadow-sm"
                    : "text-muted hover:bg-background hover:text-primary"
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
        <p className="py-20 text-center text-muted">{listing.loading}</p>
      ) : products.length === 0 ? (
        <p className="py-20 text-center text-muted">
          {filters.searchQuery ? listing.noSearchResults : shop.empty}
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted">
            {products.length}{" "}
            {products.length === 1 ? listing.pieceSingular : listing.piecePlural}
            {cursor ? "+" : ""}
          </p>
          <div className="flex flex-col gap-4 md:gap-5">
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
                className="cursor-pointer rounded-full bg-primary px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-background shadow-sm transition-shadow hover:shadow-md disabled:opacity-50"
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
