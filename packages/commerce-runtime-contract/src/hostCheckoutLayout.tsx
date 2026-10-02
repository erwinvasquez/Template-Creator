/**
 * Clases de layout checkout V2 (host-owned motor + skin template).
 * Evitan overflow horizontal en grid/flex por min-width:auto en hijos.
 */

/** Acota ancho en columnas grid, flex y campos full-width. */
export const hostCheckoutContainWidthClassName = "min-w-0 max-w-full";

/** Contenedor interior (padding horizontal lo define cada template). */
export const hostCheckoutLayoutPageInnerClassName =
  "mx-auto w-full min-w-0 max-w-7xl";

/** Grid principal formulario + resumen. */
export const hostCheckoutLayoutGridClassName =
  "mt-12 grid w-full min-w-0 max-w-full gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]";

export const hostCheckoutLayoutFormColumnClassName =
  "min-w-0 max-w-full space-y-10";

export const hostCheckoutLayoutSectionClassName =
  "min-w-0 max-w-full space-y-4";

export const hostCheckoutLayoutAsideClassName =
  "min-w-0 max-w-full border border-border bg-surface p-6 md:p-8";

export const hostCheckoutLayoutActionsClassName = "min-w-0 max-w-full";

export const hostCheckoutLayoutNoticesClassName = "mt-6 min-w-0 max-w-full";

export const hostCheckoutLayoutSummaryInnerClassName = "mt-6 min-w-0 max-w-full";

/** Texto largo en radios / métodos de envío. */
export const hostCheckoutChoiceLabelTextClassName = "break-words whitespace-normal";

/** Fila de línea en resumen de pedido (thumbnail + texto). */
export const hostCheckoutLineItemRowClassName = `flex ${hostCheckoutContainWidthClassName} gap-3`;

/** Título de producto: máx. 2 líneas, sin nowrap. */
export const hostCheckoutLineItemTitleClampClassName =
  "line-clamp-2 max-w-full break-words";

/** Variante / opciones secundarias. */
export const hostCheckoutLineItemVariantClampClassName =
  "line-clamp-2 max-w-full break-words";

/** Cantidad y precios debajo del título. */
export const hostCheckoutLineItemPricingClassName =
  "mt-0.5 min-w-0 max-w-full text-xs text-muted";
