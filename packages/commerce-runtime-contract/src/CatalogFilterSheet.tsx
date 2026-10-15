"use client";

import { useEffect, useMemo, useState } from "react";

import type { CatalogFilterPatch, ProductFilterViewModel } from "./catalog";
import type { ReactNode, RefObject, Dispatch, SetStateAction } from "react";
import type { CatalogFilterSheetLabels } from "./catalogFilterSheetLabels";
import {
  catalogFilterChipButtonClassName,
  catalogFilterChipRowClassName,
  catalogFilterDesktopPanelMotionClassName,
  catalogFilterOverlayMotionClassName,
  catalogFilterPanelDesktopSheetClassName,
  catalogFilterPanelDragHandleClassName,
  catalogFilterPanelFooterClassName,
  catalogFilterPanelHeaderClassName,
  catalogFilterPanelMobileSheetClassName,
  catalogFilterPanelMotionClassName,
  catalogFilterPanelOverlayClassName,
  catalogFilterPanelScrollBodyClassName,
  catalogFilterSalesModeCardClassName,
  catalogFilterSalesModeCardStateClassName,
  catalogFilterSalesModeGridClassName,
  catalogFilterSectionTitleClassName,
} from "./catalogFilterPanelPresentation";
import type { CatalogFilterSalesModeOption } from "./catalogFilterSalesMode";
import { hostCatalogSearchInputClassName } from "./hostCatalogLayout";
import { useCatalogFilterPanelLifecycle } from "./useCatalogFilterPanelLifecycle";

export type CatalogFilterSheetProps = Readonly<{
  filters: ProductFilterViewModel;
  open: boolean;
  onClose: () => void;
  onApply: (patch: CatalogFilterPatch) => void;
  labels: CatalogFilterSheetLabels;
  salesModeOptions?: CatalogFilterSalesModeOption[] | null;
  catalogSectionLabel?: string;
}>;

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function visibleFacetOptions(
  options: ReadonlyArray<{ value: string; label: string; count?: number }>,
  selected: readonly string[],
) {
  return options.filter((opt) => (opt.count ?? 0) > 0 || selected.includes(opt.value));
}

function ChipSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className={catalogFilterSectionTitleClassName}>{title}</h3>
      <div className={catalogFilterChipRowClassName}>{children}</div>
    </section>
  );
}

export function CatalogFilterSheet({
  filters,
  open,
  onClose,
  onApply,
  labels,
  salesModeOptions,
  catalogSectionLabel = "Catálogo",
}: CatalogFilterSheetProps) {
  const [draft, setDraft] = useState<CatalogFilterPatch>({});
  const { mounted, visible, closeButtonRef } = useCatalogFilterPanelLifecycle(open, onClose);

  useEffect(() => {
    if (!open) return;
    setDraft({
      salesMode: filters.salesMode,
      categoryIds: filters.activeCategoryIds ?? [],
      collectionIds: filters.activeCollectionIds ?? [],
      brandIds: filters.activeBrandIds ?? [],
      colors: filters.activeColors ?? [],
      sizes: filters.activeSizes ?? [],
      materials: filters.activeMaterials ?? [],
      priceMin: filters.activePriceMin ?? null,
      priceMax: filters.activePriceMax ?? null,
      hideOutOfStock: filters.hideOutOfStock ?? false,
      hasDiscount: filters.hasDiscount ?? false,
    });
  }, [open, filters]);

  const facets = filters.facets;

  const facetSections = useMemo(() => {
    if (!facets) return [];
    const out: Array<{ key: string; title: string; options: Array<{ value: string; label: string }> }> = [];
    if (facets.colors.length) out.push({ key: "colors", title: labels.colors, options: facets.colors });
    if (facets.sizes.length) out.push({ key: "sizes", title: labels.sizes, options: facets.sizes });
    if (facets.materials.length) out.push({ key: "materials", title: labels.materials, options: facets.materials });
    return out;
  }, [facets, labels]);

  if (!mounted) return null;

  const overlayMotion = catalogFilterOverlayMotionClassName(visible);
  const mobileMotion = catalogFilterPanelMotionClassName(visible);
  const desktopMotion = catalogFilterDesktopPanelMotionClassName(visible);

  function chipClass(active: boolean) {
    return `${catalogFilterChipButtonClassName} ${active ? "border-primary bg-primary text-background" : "border-border"}`;
  }

  return (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-label={labels.title}
      data-commerce-filter-panel
    >
      <button
        type="button"
        className={`${catalogFilterPanelOverlayClassName} ${overlayMotion}`}
        aria-label={labels.close}
        onClick={onClose}
      />
      <div
        data-commerce-filter-bottom-sheet
        className={`${catalogFilterPanelMobileSheetClassName} ${mobileMotion}`}
      >
        <div className={catalogFilterPanelDragHandleClassName} aria-hidden />
        <PanelBody
          labels={labels}
          catalogSectionLabel={catalogSectionLabel}
          salesModeOptions={salesModeOptions}
          draft={draft}
          setDraft={setDraft}
          filters={filters}
          facetSections={facetSections}
          showAvailability
          chipClass={chipClass}
          closeButtonRef={closeButtonRef}
          onClose={onClose}
          onApply={onApply}
        />
      </div>
      <div
        data-commerce-filter-side-sheet
        className={`${catalogFilterPanelDesktopSheetClassName} ${desktopMotion}`}
        data-commerce-filter-side-sheet-side="left"
      >
        <PanelBody
          labels={labels}
          catalogSectionLabel={catalogSectionLabel}
          salesModeOptions={salesModeOptions}
          draft={draft}
          setDraft={setDraft}
          filters={filters}
          facetSections={facetSections}
          showAvailability
          chipClass={chipClass}
          closeButtonRef={closeButtonRef}
          onClose={onClose}
          onApply={onApply}
        />
      </div>
    </div>
  );
}

type PanelBodyProps = Readonly<{
  labels: CatalogFilterSheetLabels;
  catalogSectionLabel: string;
  salesModeOptions?: CatalogFilterSalesModeOption[] | null;
  draft: CatalogFilterPatch;
  setDraft: Dispatch<SetStateAction<CatalogFilterPatch>>;
  filters: ProductFilterViewModel;
  facetSections: Array<{ key: string; title: string; options: Array<{ value: string; label: string }> }>;
  showAvailability: boolean;
  chipClass: (active: boolean) => string;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onApply: (patch: CatalogFilterPatch) => void;
}>;

function PanelBody({
  labels,
  catalogSectionLabel,
  salesModeOptions,
  draft,
  setDraft,
  filters,
  facetSections,
  showAvailability,
  chipClass,
  closeButtonRef,
  onClose,
  onApply,
}: PanelBodyProps) {
  const activeSalesMode = draft.salesMode ?? filters.salesMode;

  return (
    <>
      <header className={catalogFilterPanelHeaderClassName}>
        <h2 className="font-serif text-lg md:text-xl">{labels.title}</h2>
        <button ref={closeButtonRef} type="button" className="text-sm text-muted" onClick={onClose}>
          {labels.close}
        </button>
      </header>
      <div className={catalogFilterPanelScrollBodyClassName}>
        {salesModeOptions && salesModeOptions.length >= 2 ? (
          <section data-commerce-filter-catalog-mode>
            <h3 className={catalogFilterSectionTitleClassName}>{catalogSectionLabel}</h3>
            <div className={catalogFilterSalesModeGridClassName} role="group" aria-label={catalogSectionLabel}>
              {salesModeOptions.map((opt) => {
                const active = activeSalesMode === opt.salesMode;
                return (
                  <button
                    key={opt.salesMode}
                    type="button"
                    className={`${catalogFilterSalesModeCardClassName} ${catalogFilterSalesModeCardStateClassName(active)}`}
                    aria-pressed={active}
                    onClick={() => setDraft((d) => ({ ...d, salesMode: opt.salesMode }))}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {filters.categories.length > 0 ? (
          <ChipSection title={labels.categories}>
            {filters.categories.map((c) => {
              const active = (draft.categoryIds ?? []).includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={chipClass(active)}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      categoryIds: toggleValue(d.categoryIds ?? [], c.id),
                      categoryId: null,
                    }))
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </ChipSection>
        ) : null}

        {filters.collections.length > 0 ? (
          <ChipSection title={labels.collections}>
            {filters.collections.map((c) => {
              const active = (draft.collectionIds ?? []).includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={chipClass(active)}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      collectionIds: toggleValue(d.collectionIds ?? [], c.id),
                      collectionId: null,
                    }))
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </ChipSection>
        ) : null}

        {filters.brands.length > 0 ? (
          <ChipSection title={labels.brands}>
            {filters.brands.map((b) => {
              const active = (draft.brandIds ?? []).includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  className={chipClass(active)}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      brandIds: toggleValue(d.brandIds ?? [], b.id),
                      brandId: null,
                    }))
                  }
                >
                  {b.label}
                </button>
              );
            })}
          </ChipSection>
        ) : null}

        {facetSections.map((section) => (
          <ChipSection key={section.key} title={section.title}>
            {visibleFacetOptions(
              section.options,
              (draft[section.key as "colors" | "sizes" | "materials"] as string[] | undefined) ??
                [],
            ).map((opt) => {
              const listKey = section.key as "colors" | "sizes" | "materials";
              const active = ((draft[listKey] as string[] | undefined) ?? []).includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={chipClass(active)}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      [listKey]: toggleValue((d[listKey] as string[] | undefined) ?? [], opt.value),
                    }))
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </ChipSection>
        ))}

        {filters.facets && (filters.facets.priceMin != null || filters.facets.priceMax != null) ? (
          <section>
            <h3 className={catalogFilterSectionTitleClassName}>{labels.price}</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-muted">
                {labels.priceMin}
                <input
                  type="number"
                  min={0}
                  className={`mt-1 w-full border border-border px-3 py-2 ${hostCatalogSearchInputClassName}`}
                  value={draft.priceMin ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      priceMin: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                />
              </label>
              <label className="text-xs text-muted">
                {labels.priceMax}
                <input
                  type="number"
                  min={0}
                  className={`mt-1 w-full border border-border px-3 py-2 ${hostCatalogSearchInputClassName}`}
                  value={draft.priceMax ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      priceMax: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                />
              </label>
            </div>
          </section>
        ) : null}

        {showAvailability ? (
          <section className="space-y-2">
            <h3 className={catalogFilterSectionTitleClassName}>{labels.availability}</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(draft.hideOutOfStock)}
                onChange={(e) => setDraft((d) => ({ ...d, hideOutOfStock: e.target.checked }))}
              />
              {labels.inStockOnly}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(draft.hasDiscount)}
                onChange={(e) => setDraft((d) => ({ ...d, hasDiscount: e.target.checked }))}
              />
              {labels.hasDiscount}
            </label>
          </section>
        ) : null}
      </div>
      <footer className={catalogFilterPanelFooterClassName}>
        <button
          type="button"
          className="flex-1 border border-border py-3 text-sm font-medium"
          onClick={() => {
            onApply({
              salesMode: draft.salesMode,
              categoryIds: [],
              collectionIds: [],
              brandIds: [],
              colors: [],
              sizes: [],
              materials: [],
              priceMin: null,
              priceMax: null,
              hideOutOfStock: false,
              hasDiscount: false,
              categoryId: null,
              collectionId: null,
              brandId: null,
            });
            onClose();
          }}
        >
          {labels.clear}
        </button>
        <button
          type="button"
          className="flex-1 bg-primary py-3 text-sm font-semibold text-background"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          {labels.apply}
        </button>
      </footer>
    </>
  );
}
