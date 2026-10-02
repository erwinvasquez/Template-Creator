import type { SalesMode } from "./catalog";
import type { CommerceTemplateCapabilities } from "./capabilities";

export type CatalogSalesModeEntryOption = Readonly<{
  salesMode: SalesMode;
  label: string;
  description: string;
  href: string;
}>;

export type CatalogSalesModeUiCopy = Readonly<{
  stock?: {
    navLabel?: string;
    shopBanner?: string;
  };
  madeToOrder?: {
    navLabel?: string;
    shopBanner?: string;
  };
  nav?: ReadonlyArray<{
    salesMode: SalesMode;
    label: string;
  }>;
}>;

export function parseCatalogSalesModeQuery(
  value: string | null | undefined,
): SalesMode | null {
  if (value === "stock" || value === "madeToOrder") return value;
  return null;
}

/** Misma condición que dual catalog nav: host `salesModeSwitch === "supported"`. */
export function showsDualCatalogSalesMode(
  capabilities: CommerceTemplateCapabilities | null | undefined,
): boolean {
  return capabilities?.salesModeSwitch === "supported";
}

/**
 * Selector inicial solo cuando hay dos catálogos y la URL aún no fija `salesMode`
 * (deep links con `?salesMode=` entran directo al listado).
 */
export function shouldShowCatalogEntrySelector(
  capabilities: CommerceTemplateCapabilities | null | undefined,
  salesModeQuery: string | null | undefined,
): boolean {
  if (!showsDualCatalogSalesMode(capabilities)) return false;
  return parseCatalogSalesModeQuery(salesModeQuery) === null;
}

const SALES_MODE_ORDER: SalesMode[] = ["stock", "madeToOrder"];

function labelForMode(
  ui: CatalogSalesModeUiCopy,
  mode: SalesMode,
): string {
  const fromNav = ui.nav?.find((item) => item.salesMode === mode)?.label;
  if (fromNav?.trim()) return fromNav.trim();
  if (mode === "madeToOrder") {
    return ui.madeToOrder?.navLabel?.trim() ?? "";
  }
  return ui.stock?.navLabel?.trim() ?? "";
}

function descriptionForMode(
  ui: CatalogSalesModeUiCopy,
  mode: SalesMode,
): string {
  if (mode === "madeToOrder") {
    return ui.madeToOrder?.shopBanner?.trim() ?? "";
  }
  return ui.stock?.shopBanner?.trim() ?? "";
}

export function buildCatalogSalesModeEntryOptions(
  ui: CatalogSalesModeUiCopy,
  hrefFor: (mode: SalesMode) => string,
): CatalogSalesModeEntryOption[] {
  return SALES_MODE_ORDER.map((salesMode) => ({
    salesMode,
    label: labelForMode(ui, salesMode),
    description: descriptionForMode(ui, salesMode),
    href: hrefFor(salesMode),
  })).filter((opt) => opt.label.length > 0);
}

/** Tab superior dual-mode: subrayado persistente en activo. */
export function salesModeSwitchLinkClassName(active: boolean): string {
  const base =
    "inline-flex items-center border-b-2 pb-0.5 cursor-pointer text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  if (active) {
    return `${base} border-primary text-primary`;
  }
  return `${base} border-transparent text-muted opacity-90 hover:text-primary hover:opacity-100`;
}

export const catalogEntrySectionClassName = "mx-auto w-full min-w-0 max-w-3xl py-8 md:py-12";

export const catalogEntryHeadingClassName =
  "text-center text-lg font-medium text-primary md:text-xl";

export const catalogEntryGridClassName =
  "mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6";

export const catalogEntryCardClassName =
  "group flex min-h-[7.5rem] flex-col justify-center rounded-md border border-border bg-background px-6 py-6 text-left transition-colors duration-200 hover:border-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export const catalogEntryCardTitleClassName =
  "text-base font-semibold text-primary group-hover:text-primary";

export const catalogEntryCardDescriptionClassName =
  "mt-2 text-sm leading-relaxed text-muted";
