"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ProductFilterViewModel,
  ProductSearchViewModel,
  SalesMode,
} from "@shopenlinea/commerce-runtime-contract";
import {
  CatalogSalesModeEntrySelector,
  buildCatalogSalesModeEntryOptions,
  parseStorefrontCatalogAppliedQuery,
  resolvePlpReturnHrefForRouter,
  shouldShowCatalogEntrySelector,
  warmStorefrontCatalogGrid,
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

function stubFilters(
  salesMode: SalesMode,
  searchQuery: string | null,
): ProductFilterViewModel {
  return {
    salesMode,
    searchQuery: searchQuery ?? undefined,
    activeCategoryIds: [],
    activeCollectionIds: [],
    activeBrandIds: [],
    activeColors: [],
    activeSizes: [],
    activeMaterials: [],
    activePriceMin: null,
    activePriceMax: null,
    hideOutOfStock: false,
    hasDiscount: false,
    activeFilterCount: 0,
    facets: null,
    categories: [],
    collections: [],
    brands: [],
  };
}

export function CommerceAwareCatalog() {
  const host = useRequiredCommerceHost();
  const capabilities = useCommerceCapabilities();
  const { payload, basePath } = useSiteContent();
  const searchParams = useSearchParams();
  const salesModeSlug = searchParams.get(SHOP_QUERY.salesMode);
  const searchQuery = searchParams.get(SHOP_QUERY.search);

  const defaultSalesMode =
    parseSalesModeQuery(salesModeSlug) ?? host.getPersistedCatalogSalesMode?.() ?? "stock";
  const applied = useMemo(
    () =>
      parseStorefrontCatalogAppliedQuery({
        searchParams,
        defaultSalesMode,
        taxonomy: {
          categories: payload.catalog.categories,
          collections: payload.catalog.collections,
        },
        categorySlugParam: SHOP_QUERY.category,
        collectionSlugParam: SHOP_QUERY.collection,
      }),
    [searchParams, defaultSalesMode, payload.catalog.categories, payload.catalog.collections],
  );

  const initialGrid = warmStorefrontCatalogGrid({
    session: host.getCatalogSession?.(),
    listingKey: host.getCatalogListingQueryKey?.() ?? "",
  });
  const [data, setData] = useState<ProductSearchViewModel | null>(initialGrid.data);
  const [filters, setFilters] = useState<ProductFilterViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listingBusy, setListingBusy] = useState(!initialGrid.ready);
  const tick = useCatalogListingTick();
  const router = useRouter();
  const freshEntryHandled = useRef(false);

  const catalogReturnNavigation = host.hasCatalogReturnNavigation?.() ?? false;

  const showCatalogEntry = shouldShowCatalogEntrySelector(
    capabilities,
    salesModeSlug,
    { catalogReturnNavigation },
  );

  useEffect(() => {
    if (freshEntryHandled.current) return;
    freshEntryHandled.current = true;
    if (parseSalesModeQuery(salesModeSlug)) return;
    if (catalogReturnNavigation) return;
    host.actions.clearCatalogNavigationSession?.();
  }, [host, salesModeSlug, catalogReturnNavigation]);

  useEffect(() => {
    if (showCatalogEntry) return;
    if (salesModeSlug) return;
    if (!catalogReturnNavigation) return;
    const returnHref = host.getPlpReturnHref?.();
    if (!returnHref) return;
    router.replace(resolvePlpReturnHrefForRouter(returnHref, basePath));
    host.actions.clearCatalogReturnNavigation?.();
  }, [
    showCatalogEntry,
    salesModeSlug,
    catalogReturnNavigation,
    host,
    basePath,
    router,
  ]);

  useEffect(() => {
    if (showCatalogEntry) return;
    host.actions.replaceCatalogAppliedState?.(applied.filterPatch);
  }, [host, showCatalogEntry, applied.signature]);

  useEffect(() => {
    if (showCatalogEntry) return;
    let cancelled = false;
    const warm = warmStorefrontCatalogGrid({
      session: host.getCatalogSession?.(),
      listingKey: host.getCatalogListingQueryKey?.() ?? "",
    });
    if (!warm.ready) setListingBusy(true);
    void host
      .getListing()
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setFilters(res.filters);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setError(requireUi(payload).errors.catalogLoadFailed);
        }
      })
      .finally(() => {
        if (!cancelled) setListingBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [host, tick, applied.signature, payload, showCatalogEntry]);

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

  const listingKey = host.getCatalogListingQueryKey?.() ?? "";
  const session = host.getCatalogSession?.();
  const sessionStale = Boolean(session?.queryKey && session.queryKey !== listingKey);
  const gridLoading = listingBusy || sessionStale;

  const viewFilters =
    filters ?? stubFilters(applied.filterPatch.salesMode ?? defaultSalesMode, searchQuery);
  const viewData: ProductSearchViewModel =
    data ?? {
      products: [],
      nextCursor: null,
      query: {},
      sortOptions: [],
    };

  return (
    <ProductListingView
      data={viewData}
      filters={viewFilters}
      capabilities={capabilities}
      listingQueryKey={listingKey}
      actions={{
        loadMoreProducts: host.actions.loadMoreProducts,
        restorePlpScrollPosition: host.actions.restorePlpScrollPosition,
        preparePlpNavigation: host.actions.preparePlpNavigation,
      }}
      loading={gridLoading}
      errorMessage={error}
    />
  );
}
