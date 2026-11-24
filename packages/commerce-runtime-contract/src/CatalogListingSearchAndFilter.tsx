"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";

import type { CatalogFilterPatch, ProductFilterViewModel } from "./catalog";
import type { CommerceTemplateCapabilities } from "./capabilities";
import { CatalogFilterSheet } from "./CatalogFilterSheet";
import {
  resolveCatalogFilterSheetLabels,
  resolveCatalogFilterTriggerLabel,
} from "./catalogFilterSheetLabels";
import {
  catalogListingFilterToolbarClassName,
  catalogListingFilterToolbarSearchFormClassName,
} from "./catalogFilterPanelPresentation";
import { resolveCatalogFilterSalesModeOptions } from "./catalogFilterSalesMode";
import type { CatalogSalesModeUiCopy } from "./catalogSalesModeEntry";
import { CatalogListingPageHeading } from "./CatalogListingPageHeading";
import { hostCatalogFilterTriggerClassName, hostCatalogSearchInputClassName } from "./hostCatalogLayout";

/** Hash de la lupa de la cabecera (`/tienda#buscar`). */
export const CATALOG_SEARCH_HASH = "buscar";

export type CatalogListingSearchAndFilterProps = Readonly<{
  filters: ProductFilterViewModel;
  capabilities?: CommerceTemplateCapabilities;
  salesModeUi?: CatalogSalesModeUiCopy;
  listing: Parameters<typeof resolveCatalogFilterSheetLabels>[0] & {
    searchLabel: string;
    searchPlaceholder: string;
    collectionPrefix?: string;
    /** Aviso de sugerencias; `{query}` se reemplaza por la búsqueda. */
    searchSuggestionsNotice?: string;
  };
  showSearch: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSubmitSearch: () => void;
  onApplyFilters: (patch: CatalogFilterPatch) => void;
  searchFormClassName?: string;
  searchInputClassName?: string;
  toolbarClassName?: string;
  filterTriggerClassName?: string;
  catalogSectionLabel?: string;
  afterToolbar?: ReactNode;
}>;

export function CatalogListingSearchAndFilter({
  filters,
  capabilities,
  salesModeUi,
  listing,
  showSearch,
  search,
  onSearchChange,
  onSubmitSearch,
  onApplyFilters,
  searchFormClassName = "",
  searchInputClassName = "border border-border bg-background px-4 py-2.5 focus:border-primary sm:py-3",
  toolbarClassName = catalogListingFilterToolbarClassName,
  filterTriggerClassName = hostCatalogFilterTriggerClassName,
  catalogSectionLabel = "Catálogo",
  afterToolbar,
}: CatalogListingSearchAndFilterProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // La lupa de la cabecera lleva a la tienda con `#buscar`: el buscador queda enfocado (en el celular
  // abre el teclado). También si ya estaba en la tienda y solo cambia el hash.
  useEffect(() => {
    if (!showSearch) return;
    const focusIfRequested = () => {
      if (window.location.hash !== `#${CATALOG_SEARCH_HASH}`) return;
      const input = searchInputRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      input.scrollIntoView({ block: "center" });
    };
    focusIfRequested();
    window.addEventListener("hashchange", focusIfRequested);
    return () => window.removeEventListener("hashchange", focusIfRequested);
  }, [showSearch]);
  const activeFilters = filters.activeFilterCount ?? 0;
  const sheetLabels = resolveCatalogFilterSheetLabels(listing);
  const filterLabel = resolveCatalogFilterTriggerLabel(listing);

  const salesModeOptions = useMemo(
    () => resolveCatalogFilterSalesModeOptions(capabilities, salesModeUi ?? {}),
    [capabilities, salesModeUi],
  );

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmitSearch();
  }

  const collectionPrefix = listing.collectionPrefix ?? "Colección:";

  return (
    <>
      <CatalogListingPageHeading filters={filters} collectionPrefix={collectionPrefix} />
      <div className={toolbarClassName} data-commerce-plp-filter-toolbar>
        {showSearch ? (
          <form
            className={`${catalogListingFilterToolbarSearchFormClassName} ${searchFormClassName}`.trim()}
            onSubmit={onSearchSubmit}
          >
            <label className="sr-only" htmlFor="commerce-search">
              {listing.searchLabel}
            </label>
            <input
              ref={searchInputRef}
              id="commerce-search"
              type="search"
              enterKeyHint="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={listing.searchPlaceholder}
              className={`${hostCatalogSearchInputClassName} w-full ${searchInputClassName}`.trim()}
            />
          </form>
        ) : null}
        <button
          type="button"
          data-commerce-filter-trigger
          className={filterTriggerClassName}
          onClick={() => setFilterOpen(true)}
        >
          {filterLabel}
          {activeFilters > 0 ? ` (${activeFilters})` : ""}
        </button>
      </div>
      {filters.searchSuggestionsOnly && filters.searchQuery ? (
        <p className="mt-4 text-sm text-muted" data-commerce-plp-search-suggestions role="status">
          {(listing.searchSuggestionsNotice ?? "No encontramos «{query}». Te puede interesar:").replace(
            "{query}",
            filters.searchQuery,
          )}
        </p>
      ) : null}
      {afterToolbar}
      <CatalogFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        labels={sheetLabels}
        salesModeOptions={salesModeOptions}
        catalogSectionLabel={catalogSectionLabel}
        onApply={onApplyFilters}
      />
    </>
  );
}
