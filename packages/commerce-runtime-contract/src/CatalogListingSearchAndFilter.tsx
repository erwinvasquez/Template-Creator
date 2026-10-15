"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";

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

export type CatalogListingSearchAndFilterProps = Readonly<{
  filters: ProductFilterViewModel;
  capabilities?: CommerceTemplateCapabilities;
  salesModeUi?: CatalogSalesModeUiCopy;
  listing: Parameters<typeof resolveCatalogFilterSheetLabels>[0] & {
    searchLabel: string;
    searchPlaceholder: string;
    collectionPrefix?: string;
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
              id="commerce-search"
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
