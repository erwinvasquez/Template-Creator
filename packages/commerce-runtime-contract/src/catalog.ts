import type { MadeToOrderUpsellViewModel } from "./product";

/** Stock / availability labels for storefront UI. */
export type StockLabel = "available" | "out_of_stock" | "contact";

export type SalesMode = "stock" | "madeToOrder";

export interface TaxonomyOptionViewModel {
  id: string;
  slug: string;
  label: string;
  count?: number;
}

export interface CatalogSortOptionViewModel {
  id: string;
  label: string;
}

export interface CatalogQueryViewModel {
  searchQuery?: string;
  categoryId?: string | null;
  collectionId?: string | null;
  brandId?: string | null;
  sort?: string;
  cursor?: string | null;
}

export interface CatalogAdvancedFilterPatch {
  categoryIds?: string[] | null;
  collectionIds?: string[] | null;
  brandIds?: string[] | null;
  colors?: string[] | null;
  sizes?: string[] | null;
  materials?: string[] | null;
  priceMin?: number | null;
  priceMax?: number | null;
  hideOutOfStock?: boolean | null;
  hasDiscount?: boolean | null;
}

export interface CatalogFilterPatch extends CatalogAdvancedFilterPatch {
  searchQuery?: string | null;
  categoryId?: string | null;
  collectionId?: string | null;
  brandId?: string | null;
  sort?: string | null;
  salesMode?: SalesMode;
}

export interface CatalogFacetOptionViewModel {
  value: string;
  label: string;
  count?: number;
}

export interface CatalogFacetsViewModel {
  colors: CatalogFacetOptionViewModel[];
  sizes: CatalogFacetOptionViewModel[];
  materials: CatalogFacetOptionViewModel[];
  categories?: CatalogFacetOptionViewModel[];
  collections?: CatalogFacetOptionViewModel[];
  brands?: CatalogFacetOptionViewModel[];
  priceMin: number | null;
  priceMax: number | null;
}

export interface ProductFilterViewModel {
  searchQuery?: string;
  activeCategoryId?: string | null;
  activeCollectionId?: string | null;
  activeBrandId?: string | null;
  activeSort?: string;
  salesMode: SalesMode;
  /**
   * Dual-mode + madeToOrder only. Whether the MTO channel accepts orders now.
   * When `false`, templates show closed warning (listing/cart).
   */
  madeToOrderAcceptingOrders?: boolean;
  /**
   * Dual-mode + madeToOrder only. Host sends **value only** (e.g. `"3–5 días"`).
   * Template prefixes with `ui.salesMode.madeToOrder.preparationLabel`.
   * Do NOT send `"Preparación: 3–5 días"`.
   */
  preparationPromiseLabel?: string | null;
  /**
   * Dual-mode + madeToOrder closed. Host sends **reopen value only**
   * (e.g. `"10:00"` or `"lunes 10:00"`). Template may prefix with
   * `ui.salesMode.madeToOrder.reopensPrefix`.
   */
  madeToOrderReopensAtLabel?: string | null;
  categories: TaxonomyOptionViewModel[];
  collections: TaxonomyOptionViewModel[];
  brands: TaxonomyOptionViewModel[];
  activeCategoryIds?: string[];
  activeCollectionIds?: string[];
  activeBrandIds?: string[];
  activeColors?: string[];
  activeSizes?: string[];
  activeMaterials?: string[];
  activePriceMin?: number | null;
  activePriceMax?: number | null;
  hideOutOfStock?: boolean;
  hasDiscount?: boolean;
  activeFilterCount?: number;
  facets?: CatalogFacetsViewModel | null;
}

export interface ProductCardViewModel {
  id: string;
  slug: string;
  href: string;
  name: string;
  imageUrl: string | null;
  galleryPreview?: string | null;
  displayPrice: string;
  compareAtPrice?: string | null;
  discountPercent?: number | null;
  currency: string;
  hasPriceRange?: boolean;
  defaultVariantId?: string | null;
  stockLabel?: StockLabel | null;
  shortDescription?: string | null;
  bulletPoints?: string[];
  categoryLabels?: string[];
  badges?: string[];
  /** Optional card-level prep hint from host (made-to-order listings). */
  preparationPromiseLabel?: string | null;
  /**
   * Stock PLP: host offers MTO PDP when immediate stock is 0 (dual-mode, stock catalog).
   * `productHref` should include `?salesMode=madeToOrder` when dual-mode applies.
   */
  madeToOrderUpsell?: MadeToOrderUpsellViewModel | null;
  /** SEARCH-01: variante resaltada en listado cuando la consulta coincide con una opción. */
  matchedVariantId?: string | null;
  matchedOptionName?: string | null;
  matchedOptionValue?: string | null;
  /** Secundario; no sustituye `displayPrice` (qty 1). */
  quantityPricingTeaser?: string | null;
}

export interface CatalogSessionViewModel {
  products: ProductCardViewModel[];
  nextCursor: string | null;
  queryKey: string;
  isLoadingMore: boolean;
}

export interface ProductSearchViewModel {
  products: ProductCardViewModel[];
  nextCursor: string | null;
  query: CatalogQueryViewModel;
  sortOptions: CatalogSortOptionViewModel[];
}
