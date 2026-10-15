export type CatalogFilterSheetLabels = Readonly<{
  title: string;
  apply: string;
  clear: string;
  close: string;
  categories: string;
  collections: string;
  brands: string;
  colors: string;
  sizes: string;
  materials: string;
  price: string;
  availability: string;
  discount: string;
  inStockOnly: string;
  hasDiscount: string;
  priceMin: string;
  priceMax: string;
}>;

export const CATALOG_FILTER_SHEET_DEFAULT_LABELS: CatalogFilterSheetLabels = {
  title: "Filtros",
  apply: "Aplicar",
  clear: "Limpiar",
  close: "Cerrar",
  categories: "Categorías",
  collections: "Colecciones",
  brands: "Marcas",
  colors: "Color",
  sizes: "Talla",
  materials: "Material",
  price: "Precio",
  availability: "Disponibilidad",
  discount: "Descuento",
  inStockOnly: "Solo disponibles",
  hasDiscount: "Con descuento",
  priceMin: "Mínimo",
  priceMax: "Máximo",
};

type ListingUiCopy = Partial<{
  filterLabel: string;
  filterTitle: string;
  filterApply: string;
  filterClear: string;
  filterClose: string;
  filterCategories: string;
  filterCollections: string;
  filterBrands: string;
  filterColors: string;
  filterSizes: string;
  filterMaterials: string;
  filterPrice: string;
  filterAvailability: string;
  filterDiscount: string;
  filterInStock: string;
  filterHasDiscount: string;
  filterPriceMin: string;
  filterPriceMax: string;
}>;

export function resolveCatalogFilterSheetLabels(listing: ListingUiCopy): CatalogFilterSheetLabels {
  const d = CATALOG_FILTER_SHEET_DEFAULT_LABELS;
  return {
    title: listing.filterTitle ?? d.title,
    apply: listing.filterApply ?? d.apply,
    clear: listing.filterClear ?? d.clear,
    close: listing.filterClose ?? d.close,
    categories: listing.filterCategories ?? d.categories,
    collections: listing.filterCollections ?? d.collections,
    brands: listing.filterBrands ?? d.brands,
    colors: listing.filterColors ?? d.colors,
    sizes: listing.filterSizes ?? d.sizes,
    materials: listing.filterMaterials ?? d.materials,
    price: listing.filterPrice ?? d.price,
    availability: listing.filterAvailability ?? d.availability,
    discount: listing.filterDiscount ?? d.discount,
    inStockOnly: listing.filterInStock ?? d.inStockOnly,
    hasDiscount: listing.filterHasDiscount ?? d.hasDiscount,
    priceMin: listing.filterPriceMin ?? d.priceMin,
    priceMax: listing.filterPriceMax ?? d.priceMax,
  };
}

export function resolveCatalogFilterTriggerLabel(listing: ListingUiCopy): string {
  return listing.filterLabel ?? "Filtros";
}
