import type { ReactNode } from "react";

/** Contenedor de página catálogo: acotado al viewport en layouts flex. */
export const catalogPageContainerClassName =
  "mx-auto w-full min-w-0 max-w-7xl px-6 pb-24 pt-28 md:px-8 md:pt-32";

/** Raíz del listado (buscador, chips, grid). */
export const catalogListingRootClassName = "min-w-0 w-full max-w-full";

/** Grid de productos: una columna en móvil, multi-columna desde sm. */
export const catalogProductGridClassName =
  "grid w-full min-w-0 max-w-full grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6";

/** Tarjeta de producto en grid. */
export const catalogProductCardClassName = "group block min-w-0 max-w-full cursor-pointer";

type CatalogCategoryScrollProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

/**
 * Fila de categorías con scroll horizontal contenido: el bleed negativo no
 * amplía html/body gracias al wrapper overflow-hidden + min-w-0.
 */
export function CatalogCategoryScroll({
  children,
  className = "",
}: CatalogCategoryScrollProps) {
  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div
        className={`category-scroll -mx-6 mb-10 flex gap-2 overflow-x-auto border-b border-border px-6 pb-6 md:-mx-8 md:px-8 ${className}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
