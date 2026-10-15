/** Overlay FILTER-01 — fade in/out (mobile + desktop). */
export const catalogFilterPanelOverlayClassName =
  "absolute inset-0 bg-primary/40 transition-opacity duration-300 ease-out motion-reduce:transition-none";

/** Panel móvil: bottom sheet (no modal centrado). */
export const catalogFilterPanelMobileSheetClassName =
  "absolute inset-x-0 bottom-0 flex max-h-[min(88vh,100dvh)] flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden";

/** Panel desktop: side sheet izquierdo (carrito permanece a la derecha). */
export const catalogFilterPanelDesktopSheetClassName =
  "absolute inset-y-0 left-0 hidden h-full w-full max-w-md flex-col overflow-hidden border-r border-border bg-background shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none md:flex";

export const catalogFilterPanelDragHandleClassName =
  "mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-border md:hidden";

export const catalogFilterPanelHeaderClassName =
  "flex shrink-0 items-center justify-between border-b border-border px-5 py-3";

export const catalogFilterPanelScrollBodyClassName =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5";

export const catalogFilterPanelFooterClassName =
  "flex shrink-0 gap-3 border-t border-border bg-background px-5 py-4";

/** Chips taxonomy: una fila, scroll horizontal, sin wrap. */
export const catalogFilterChipRowClassName =
  "catalog-filter-chip-row flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export const catalogFilterChipButtonClassName =
  "shrink-0 snap-start rounded-full border px-3 py-1.5 text-xs whitespace-nowrap";

export const catalogFilterSectionTitleClassName =
  "mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary";

/** Selector CATÁLOGO (salesMode): tarjetas, no chips de taxonomía. */
export const catalogFilterSalesModeGridClassName = "grid grid-cols-2 gap-2";

export const catalogFilterSalesModeCardClassName =
  "flex min-h-[3.25rem] w-full items-center rounded-lg border-2 px-3 py-3 text-left text-xs font-semibold leading-snug sm:px-4 sm:py-4 sm:text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function catalogFilterSalesModeCardStateClassName(active: boolean): string {
  if (active) {
    return "border-primary bg-surface text-primary shadow-sm";
  }
  return "border-border bg-background text-primary hover:border-primary/40 hover:bg-surface/60";
}

export const catalogListingFilterToolbarClassName =
  "mb-4 flex min-w-0 items-stretch gap-2 sm:max-w-2xl sm:gap-3";

export const catalogListingFilterToolbarSearchFormClassName = "min-w-0 flex-1";

export const catalogListingPageHeadingClassName =
  "mb-4 text-base font-serif tracking-wide text-primary md:text-lg";

export function catalogFilterPanelMotionClassName(visible: boolean): string {
  return visible ? "translate-y-0" : "translate-y-full";
}

export function catalogFilterDesktopPanelMotionClassName(visible: boolean): string {
  return visible ? "translate-x-0" : "-translate-x-full";
}

export function catalogFilterOverlayMotionClassName(visible: boolean): string {
  return visible ? "opacity-100" : "opacity-0";
}
